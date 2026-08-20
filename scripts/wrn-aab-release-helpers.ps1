Set-StrictMode -Version Latest

$script:WrnWebExtensions = @(
    '.html', '.js', '.css', '.json', '.webp', '.png', '.jpg',
    '.jpeg', '.svg', '.ttf', '.woff', '.woff2', '.txt'
)
$script:WrnSourceAssetDirectories = @('news-archive')
$script:WrnExcludedRootJson = '^(aggregate-errors|workflow-audit|INTEGRATION-REPORT|feature-audit)\.json$'
$script:WrnCapacitorCompatibilityFiles = @('cordova.js', 'cordova_plugins.js')

function Get-WrnNormalizedRelativePath(
    [Parameter(Mandatory = $true)][string]$Root,
    [Parameter(Mandatory = $true)][string]$Path
) {
    $resolvedRoot = [System.IO.Path]::GetFullPath($Root).TrimEnd('\')
    $resolvedPath = [System.IO.Path]::GetFullPath($Path)
    $prefix = $resolvedRoot + '\'
    if (-not $resolvedPath.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Datei liegt außerhalb des Asset-Roots: $resolvedPath"
    }
    return $resolvedPath.Substring($prefix.Length).Replace('\', '/')
}

function Test-WrnWebAssetFile(
    [Parameter(Mandatory = $true)][System.IO.FileInfo]$File,
    [Parameter(Mandatory = $true)][string]$RelativePath,
    [switch]$SourceRepository
) {
    if ($script:WrnWebExtensions -notcontains $File.Extension.ToLowerInvariant()) {
        return $false
    }
    if ($RelativePath -in $script:WrnCapacitorCompatibilityFiles) {
        return $false
    }
    if ($SourceRepository -and -not $RelativePath.Contains('/') -and $File.Name -match $script:WrnExcludedRootJson) {
        return $false
    }
    return $true
}

function Get-WrnWebAssetFiles(
    [Parameter(Mandatory = $true)][string]$Root,
    [switch]$SourceRepository
) {
    if (-not (Test-Path -LiteralPath $Root -PathType Container)) {
        throw "Asset-Verzeichnis wurde nicht gefunden: $Root"
    }
    $resolvedRoot = (Resolve-Path -LiteralPath $Root).Path
    $candidates = @()
    if ($SourceRepository) {
        $candidates += @(Get-ChildItem -LiteralPath $resolvedRoot -File)
        foreach ($directory in $script:WrnSourceAssetDirectories) {
            $assetDirectory = Join-Path $resolvedRoot $directory
            if (Test-Path -LiteralPath $assetDirectory -PathType Container) {
                $candidates += @(Get-ChildItem -LiteralPath $assetDirectory -Recurse -File)
            }
        }
    } else {
        $candidates = @(Get-ChildItem -LiteralPath $resolvedRoot -Recurse -File)
    }

    foreach ($file in $candidates) {
        $relativePath = Get-WrnNormalizedRelativePath -Root $resolvedRoot -Path $file.FullName
        if (Test-WrnWebAssetFile -File $file -RelativePath $relativePath -SourceRepository:$SourceRepository) {
            [pscustomobject]@{
                FullName = $file.FullName
                RelativePath = $relativePath
                Length = $file.Length
            }
        }
    }
}

function Get-WrnWebAssetManifest(
    [Parameter(Mandatory = $true)][string]$Root,
    [switch]$SourceRepository
) {
    $manifest = [ordered]@{}
    Get-WrnWebAssetFiles -Root $Root -SourceRepository:$SourceRepository |
        Sort-Object RelativePath |
        ForEach-Object {
            $manifest[$_.RelativePath] = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
        }
    return $manifest
}

function Compare-WrnHashManifest($Expected, $Actual) {
    $names = @($Expected.Keys + $Actual.Keys | Sort-Object -Unique)
    $differences = foreach ($name in $names) {
        $expectedHash = $Expected[$name]
        $actualHash = $Actual[$name]
        if ($expectedHash -ne $actualHash) {
            [pscustomobject]@{
                file = $name
                expected = $expectedHash
                actual = $actualHash
                issue = if ($null -eq $expectedHash) {
                    'unexpected'
                } elseif ($null -eq $actualHash) {
                    'missing'
                } else {
                    'changed'
                }
            }
        }
    }
    return @($differences)
}

function Assert-WrnDirectoryInside(
    [Parameter(Mandatory = $true)][string]$Directory,
    [Parameter(Mandatory = $true)][string]$AllowedParent
) {
    $resolvedParent = [System.IO.Path]::GetFullPath($AllowedParent).TrimEnd('\')
    $resolvedDirectory = [System.IO.Path]::GetFullPath($Directory).TrimEnd('\')
    $prefix = $resolvedParent + '\'
    if ($resolvedDirectory -eq $resolvedParent -or
        -not $resolvedDirectory.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Unsicheres Ziel außerhalb des erlaubten Verzeichnisses: $resolvedDirectory"
    }
    return $resolvedDirectory
}

function Assert-WrnPathHasNoReparsePoints(
    [Parameter(Mandatory = $true)][string]$Directory,
    [Parameter(Mandatory = $true)][string]$AllowedParent
) {
    $resolvedDirectory = Assert-WrnDirectoryInside -Directory $Directory -AllowedParent $AllowedParent
    $resolvedParent = [System.IO.Path]::GetFullPath($AllowedParent).TrimEnd('\')
    $relativePath = $resolvedDirectory.Substring($resolvedParent.Length).TrimStart('\')
    $pathsToCheck = @($resolvedParent)
    $currentPath = $resolvedParent
    foreach ($component in @($relativePath -split '\\' | Where-Object { $_ })) {
        $currentPath = Join-Path $currentPath $component
        $pathsToCheck += $currentPath
    }

    foreach ($path in $pathsToCheck) {
        if (-not (Test-Path -LiteralPath $path)) {
            continue
        }
        $item = Get-Item -LiteralPath $path -Force
        if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Unsicherer Reparse Point/Junction/Symlink im Bereinigungspfad: $path"
        }
    }
    return $resolvedDirectory
}

function Get-WrnDirectoryTreeWithoutReparsePoints(
    [Parameter(Mandatory = $true)][string]$Directory
) {
    $directories = [System.Collections.Generic.List[string]]::new()
    $files = [System.Collections.Generic.List[string]]::new()
    $pending = [System.Collections.Generic.Stack[string]]::new()
    $pending.Push($Directory)

    while ($pending.Count -gt 0) {
        $current = $pending.Pop()
        foreach ($item in @(Get-ChildItem -LiteralPath $current -Force)) {
            if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
                throw "Bereinigung abgelehnt: Reparse Point/Junction/Symlink im Webverzeichnis: $($item.FullName)"
            }
            if ($item.PSIsContainer) {
                $directories.Add($item.FullName)
                $pending.Push($item.FullName)
            } else {
                $files.Add($item.FullName)
            }
        }
    }

    return [pscustomobject]@{
        Files = @($files)
        Directories = @($directories)
    }
}

function Remove-WrnDirectoryTreeWithoutReparsePoints(
    [Parameter(Mandatory = $true)][string]$Directory
) {
    $tree = Get-WrnDirectoryTreeWithoutReparsePoints -Directory $Directory

    foreach ($file in $tree.Files) {
        $item = Get-Item -LiteralPath $file -Force
        if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Bereinigung abgelehnt: Datei wurde durch einen Reparse Point ersetzt: $file"
        }
        Remove-Item -LiteralPath $file -Force
    }
    foreach ($directoryPath in @($tree.Directories | Sort-Object Length -Descending)) {
        $item = Get-Item -LiteralPath $directoryPath -Force
        if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Bereinigung abgelehnt: Verzeichnis wurde durch einen Reparse Point ersetzt: $directoryPath"
        }
        [System.IO.Directory]::Delete($directoryPath, $false)
    }
    [System.IO.Directory]::Delete($Directory, $false)
}

function Clear-WrnWebDirectory(
    [Parameter(Mandatory = $true)][string]$WebRoot,
    [Parameter(Mandatory = $true)][string]$AndroidRoot,
    [scriptblock]$TestHook
) {
    $resolvedWebRoot = Assert-WrnPathHasNoReparsePoints -Directory $WebRoot -AllowedParent $AndroidRoot
    $webParent = Split-Path -Parent $resolvedWebRoot

    if (-not (Test-Path -LiteralPath $resolvedWebRoot)) {
        [System.IO.Directory]::CreateDirectory($resolvedWebRoot) | Out-Null
        Assert-WrnPathHasNoReparsePoints -Directory $resolvedWebRoot -AllowedParent $AndroidRoot | Out-Null
        return $resolvedWebRoot
    }
    if (-not (Test-Path -LiteralPath $resolvedWebRoot -PathType Container)) {
        throw "Webverzeichnis ist kein normales Verzeichnis: $resolvedWebRoot"
    }

    # Vollständige Vorprüfung, aber keine In-place-Löschung des aktiven webDir.
    Get-WrnDirectoryTreeWithoutReparsePoints -Directory $resolvedWebRoot | Out-Null
    if ($TestHook) { & $TestHook 'BeforeQuarantineMove' $resolvedWebRoot $null }
    Assert-WrnPathHasNoReparsePoints -Directory $resolvedWebRoot -AllowedParent $AndroidRoot | Out-Null

    $token = [guid]::NewGuid().ToString('N')
    $quarantinePath = Join-Path $webParent ".wrn-web-quarantine-$token.pending"
    $movedToQuarantine = $false
    $freshWebCreated = $false
    try {
        if (Test-Path -LiteralPath $quarantinePath) {
            throw "Aufrufgebundener Quarantänepfad existiert unerwartet: $quarantinePath"
        }
        [System.IO.Directory]::Move($resolvedWebRoot, $quarantinePath)
        $movedToQuarantine = $true
        if ($TestHook) { & $TestHook 'AfterQuarantineMove' $resolvedWebRoot $quarantinePath }

        if (Test-Path -LiteralPath $resolvedWebRoot) {
            throw "Webverzeichnispfad wurde während der Vorbereitung konkurrierend angelegt: $resolvedWebRoot"
        }
        [System.IO.Directory]::CreateDirectory($resolvedWebRoot) | Out-Null
        $freshWebCreated = $true
        Assert-WrnPathHasNoReparsePoints -Directory $resolvedWebRoot -AllowedParent $AndroidRoot | Out-Null
        if ($TestHook) { & $TestHook 'AfterFreshWebCreate' $resolvedWebRoot $quarantinePath }

        Remove-WrnDirectoryTreeWithoutReparsePoints -Directory $quarantinePath
        $movedToQuarantine = $false
        return $resolvedWebRoot
    } catch {
        $originalError = $_
        if ($movedToQuarantine -and (Test-Path -LiteralPath $quarantinePath -PathType Container)) {
            if ($freshWebCreated -and (Test-Path -LiteralPath $resolvedWebRoot -PathType Container)) {
                $freshTree = Get-WrnDirectoryTreeWithoutReparsePoints -Directory $resolvedWebRoot
                if ($freshTree.Files.Count -eq 0 -and $freshTree.Directories.Count -eq 0) {
                    [System.IO.Directory]::Delete($resolvedWebRoot, $false)
                    $freshWebCreated = $false
                }
            }
            if (-not (Test-Path -LiteralPath $resolvedWebRoot)) {
                [System.IO.Directory]::Move($quarantinePath, $resolvedWebRoot)
                $movedToQuarantine = $false
            }
        }
        throw $originalError
    }
}

function Copy-WrnWebAssets(
    [Parameter(Mandatory = $true)][string]$SourceRoot,
    [Parameter(Mandatory = $true)][string]$WebRoot
) {
    $resolvedSource = (Resolve-Path -LiteralPath $SourceRoot).Path
    $resolvedWebRoot = (Resolve-Path -LiteralPath $WebRoot).Path
    foreach ($asset in Get-WrnWebAssetFiles -Root $resolvedSource -SourceRepository) {
        $destination = Join-Path $resolvedWebRoot $asset.RelativePath.Replace('/', '\')
        [System.IO.Directory]::CreateDirectory((Split-Path -Parent $destination)) | Out-Null
        Copy-Item -LiteralPath $asset.FullName -Destination $destination -Force
    }
}

function Assert-WrnAabInputHash(
    [Parameter(Mandatory = $true)][string]$AabPath,
    [Parameter(Mandatory = $true)][string]$ExpectedSha256
) {
    if (-not (Test-Path -LiteralPath $AabPath -PathType Leaf)) {
        throw "AAB wurde nicht gefunden: $AabPath"
    }
    $expected = $ExpectedSha256.Replace(':', '').Trim().ToUpperInvariant()
    if ($expected -notmatch '^[0-9A-F]{64}$') {
        throw 'Signierung blockiert: Für den korrigierten Eingabe-Kandidaten ist noch kein gültiger erwarteter SHA-256 hinterlegt.'
    }
    $actual = (Get-FileHash -LiteralPath $AabPath -Algorithm SHA256).Hash.ToUpperInvariant()
    if ($actual -ne $expected) {
        throw "Eingabe-AAB abgelehnt. Erwarteter SHA-256: $expected. Tatsächlicher SHA-256: $actual."
    }
    return $actual
}

function Get-WrnAabSignatureEntries(
    [Parameter(Mandatory = $true)][string]$AabPath
) {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($AabPath)
    try {
        return @($archive.Entries | Where-Object {
            $_.FullName -match '^META-INF/[^/]+\.(SF|RSA|DSA|EC)$'
        } | Select-Object -ExpandProperty FullName)
    } finally {
        $archive.Dispose()
    }
}

function Get-WrnAabWebAssetManifest(
    [Parameter(Mandatory = $true)][string]$AabPath
) {
    if (-not (Test-Path -LiteralPath $AabPath -PathType Leaf)) {
        throw "AAB wurde nicht gefunden: $AabPath"
    }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($AabPath)
    $manifest = [ordered]@{}
    $prefix = 'base/assets/public/'
    try {
        foreach ($entry in @($archive.Entries | Sort-Object FullName)) {
            if (-not $entry.FullName.StartsWith($prefix, [System.StringComparison]::Ordinal) -or
                $entry.FullName.EndsWith('/')) {
                continue
            }
            $relativePath = $entry.FullName.Substring($prefix.Length)
            $extension = [System.IO.Path]::GetExtension($relativePath).ToLowerInvariant()
            if ($script:WrnWebExtensions -notcontains $extension -or
                $relativePath -in $script:WrnCapacitorCompatibilityFiles) {
                continue
            }
            if ($manifest.Contains($relativePath)) {
                throw "Doppelter Webpfad in AAB: $relativePath"
            }
            $stream = $entry.Open()
            $sha256 = [System.Security.Cryptography.SHA256]::Create()
            try {
                $hashBytes = $sha256.ComputeHash($stream)
                $manifest[$relativePath] = ([System.BitConverter]::ToString($hashBytes)).Replace('-', '')
            } finally {
                $sha256.Dispose()
                $stream.Dispose()
            }
        }
    } finally {
        $archive.Dispose()
    }
    return $manifest
}

function Get-WrnAabPayloadManifest(
    [Parameter(Mandatory = $true)][string]$AabPath
) {
    if (-not (Test-Path -LiteralPath $AabPath -PathType Leaf)) {
        throw "AAB wurde nicht gefunden: $AabPath"
    }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($AabPath)
    $manifest = [ordered]@{}
    try {
        foreach ($entry in @($archive.Entries | Sort-Object FullName)) {
            if ($entry.FullName.EndsWith('/') -or
                $entry.FullName -match '(?i)^META-INF/(MANIFEST\.MF|[^/]+\.(SF|RSA|DSA|EC))$') {
                continue
            }
            if ($manifest.Contains($entry.FullName)) {
                throw "Doppelter Payload-Pfad in AAB: $($entry.FullName)"
            }
            $stream = $entry.Open()
            $sha256 = [System.Security.Cryptography.SHA256]::Create()
            try {
                $hashBytes = $sha256.ComputeHash($stream)
                $manifest[$entry.FullName] = ([System.BitConverter]::ToString($hashBytes)).Replace('-', '')
            } finally {
                $sha256.Dispose()
                $stream.Dispose()
            }
        }
    } finally {
        $archive.Dispose()
    }
    return $manifest
}

function Test-WrnAabSignature(
    [Parameter(Mandatory = $true)][string]$AabPath,
    [Parameter(Mandatory = $true)][string]$JarsignerPath,
    [Parameter(Mandatory = $true)][string]$KeytoolPath,
    [Parameter(Mandatory = $true)][string]$ExpectedCertificateSha256
) {
    $expectedFingerprint = $ExpectedCertificateSha256.Replace(':', '').Trim().ToUpperInvariant()
    if ($expectedFingerprint -notmatch '^[0-9A-F]{64}$') {
        throw 'Der erwartete SHA-256-Zertifikat-Fingerprint ist ungültig.'
    }
    foreach ($tool in @($JarsignerPath, $KeytoolPath)) {
        if (-not (Test-Path -LiteralPath $tool -PathType Leaf)) {
            throw "Java-Prüfwerkzeug wurde nicht gefunden: $tool"
        }
    }

    $signatureEntries = @(Get-WrnAabSignatureEntries -AabPath $AabPath)
    $hasSignatureFile = @($signatureEntries | Where-Object { $_ -match '\.SF$' }).Count -gt 0
    $hasSignatureBlock = @($signatureEntries | Where-Object { $_ -match '\.(RSA|DSA|EC)$' }).Count -gt 0

    $jarsignerOutput = @(& $JarsignerPath -verify -verbose -certs $AabPath 2>&1 | ForEach-Object { $_.ToString() })
    $jarsignerExitCode = $LASTEXITCODE
    $jarsignerText = $jarsignerOutput -join [Environment]::NewLine
    $reportedVerified = $jarsignerText -match '(?im)^\s*(JAR-Datei|jar)\s+(verifiziert|verified)\.?\s*$'
    $reportedUnsigned = $jarsignerText -match '(?i)(nicht signiert|not signed|unsigned)'

    $keytoolOutput = @(& $KeytoolPath -printcert -jarfile $AabPath 2>&1 | ForEach-Object { $_.ToString() })
    $keytoolExitCode = $LASTEXITCODE
    $keytoolText = $keytoolOutput -join [Environment]::NewLine
    $fingerprintMatch = [regex]::Match($keytoolText, '(?i)SHA-?256:\s*([0-9A-F:]{64,})')
    $actualFingerprint = if ($fingerprintMatch.Success) {
        $fingerprintMatch.Groups[1].Value.Replace(':', '').ToUpperInvariant()
    } else {
        ''
    }
    $fingerprintMatches = $actualFingerprint -eq $expectedFingerprint
    $valid = (
        $hasSignatureFile -and
        $hasSignatureBlock -and
        $jarsignerExitCode -eq 0 -and
        $reportedVerified -and
        -not $reportedUnsigned -and
        $keytoolExitCode -eq 0 -and
        $fingerprintMatches
    )

    return [pscustomobject]@{
        Valid = $valid
        SignatureEntries = $signatureEntries
        HasSignatureFile = $hasSignatureFile
        HasSignatureBlock = $hasSignatureBlock
        JarsignerExitCode = $jarsignerExitCode
        JarsignerReportedVerified = $reportedVerified
        JarsignerReportedUnsigned = $reportedUnsigned
        JarsignerOutput = $jarsignerOutput
        KeytoolExitCode = $keytoolExitCode
        KeytoolOutput = $keytoolOutput
        ExpectedCertificateSha256 = $expectedFingerprint
        ActualCertificateSha256 = $actualFingerprint
        CertificateMatches = $fingerprintMatches
    }
}

function Assert-WrnAabSignature {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string]$AabPath,
        [Parameter(Mandatory = $true)][string]$JarsignerPath,
        [Parameter(Mandatory = $true)][string]$KeytoolPath,
        [Parameter(Mandatory = $true)][string]$ExpectedCertificateSha256
    )
    $result = Test-WrnAabSignature @PSBoundParameters
    if (-not $result.Valid) {
        $details = @(
            "Signaturdatei vorhanden: $($result.HasSignatureFile)",
            "Signaturblock vorhanden: $($result.HasSignatureBlock)",
            "jarsigner verifiziert gemeldet: $($result.JarsignerReportedVerified)",
            "jarsigner unsigniert gemeldet: $($result.JarsignerReportedUnsigned)",
            "Erwarteter Zertifikat-SHA-256: $($result.ExpectedCertificateSha256)",
            "Tatsächlicher Zertifikat-SHA-256: $($result.ActualCertificateSha256)"
        ) -join '; '
        throw "AAB-Signaturprüfung fehlgeschlagen. $details"
    }
    return $result
}

function Initialize-WrnNativeFileInspection {
    if (-not [System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform(
        [System.Runtime.InteropServices.OSPlatform]::Windows
    )) {
        throw 'Die sichere AAB-Artefaktbereinigung benötigt Windows-Dateiidentitäten.'
    }
    if ('WrnReleaseNative.FileInspection' -as [type]) { return }
    Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;

namespace WrnReleaseNative {
    [StructLayout(LayoutKind.Sequential)]
    public struct ByHandleFileInformation {
        public uint FileAttributes;
        public System.Runtime.InteropServices.ComTypes.FILETIME CreationTime;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastAccessTime;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWriteTime;
        public uint VolumeSerialNumber;
        public uint FileSizeHigh;
        public uint FileSizeLow;
        public uint NumberOfLinks;
        public uint FileIndexHigh;
        public uint FileIndexLow;
    }

    public static class FileInspection {
        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern SafeFileHandle CreateFileW(
            string fileName, uint desiredAccess, uint shareMode, IntPtr securityAttributes,
            uint creationDisposition, uint flagsAndAttributes, IntPtr templateFile);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool GetFileInformationByHandle(
            SafeFileHandle handle, out ByHandleFileInformation information);

        public static uint GetLinkCount(SafeFileHandle handle) {
            ByHandleFileInformation information;
            if (!GetFileInformationByHandle(handle, out information)) {
                throw new Win32Exception(Marshal.GetLastWin32Error());
            }
            return information.NumberOfLinks;
        }

        public static uint GetLinkCount(string path) {
            const uint FILE_SHARE_ALL = 0x00000001 | 0x00000002 | 0x00000004;
            const uint OPEN_EXISTING = 3;
            const uint FILE_FLAG_OPEN_REPARSE_POINT = 0x00200000;
            using (SafeFileHandle handle = CreateFileW(
                path, 0, FILE_SHARE_ALL, IntPtr.Zero, OPEN_EXISTING,
                FILE_FLAG_OPEN_REPARSE_POINT, IntPtr.Zero)) {
                if (handle.IsInvalid) throw new Win32Exception(Marshal.GetLastWin32Error());
                return GetLinkCount(handle);
            }
        }
    }
}
'@
}

function Get-WrnFileLinkCount(
    [Parameter(Mandatory = $true)][string]$Path
) {
    Initialize-WrnNativeFileInspection
    return [WrnReleaseNative.FileInspection]::GetLinkCount([System.IO.Path]::GetFullPath($Path))
}

function Get-WrnFileIdentity(
    [Parameter(Mandatory = $true)][string]$Path
) {
    $item = Get-Item -LiteralPath $Path -Force
    if ($item.PSIsContainer -or
        ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "Transaktionsartefakt ist keine normale Datei: $Path"
    }
    $linkCount = Get-WrnFileLinkCount -Path $item.FullName
    if ($linkCount -ne 1) {
        throw "Transaktionsartefakt besitzt $linkCount Hardlinks und wird abgelehnt: $Path"
    }
    return [pscustomobject]@{
        Length = $item.Length
        Sha256 = (Get-FileHash -LiteralPath $item.FullName -Algorithm SHA256).Hash
        LinkCount = $linkCount
    }
}

function Test-WrnFileMatchesIdentity(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)]$Identity
) {
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $false }
    try {
        $actual = Get-WrnFileIdentity -Path $Path
        return $actual.Length -eq [long]$Identity.Length -and
            $actual.Sha256 -eq [string]$Identity.Sha256
    } catch {
        return $false
    }
}

function Get-WrnArtifactBuildRoot(
    [Parameter(Mandatory = $true)][string]$BuildRoot
) {
    if (-not (Test-Path -LiteralPath $BuildRoot -PathType Container)) {
        throw "AAB-Build-Root wurde nicht gefunden: $BuildRoot"
    }
    $resolved = (Resolve-Path -LiteralPath $BuildRoot).Path.TrimEnd('\')
    $item = Get-Item -LiteralPath $resolved -Force
    if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "AAB-Build-Root ist ein Reparse Point/Junction/Symlink: $resolved"
    }
    return $resolved
}

function Assert-WrnArtifactPathInsideRoot(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$BuildRoot
) {
    $resolvedRoot = Get-WrnArtifactBuildRoot -BuildRoot $BuildRoot
    $resolvedPath = [System.IO.Path]::GetFullPath($Path)
    $prefix = $resolvedRoot + '\'
    if (-not $resolvedPath.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Transaktionspfad liegt außerhalb des validierten Build-Roots: $resolvedPath"
    }
    $parent = Split-Path -Parent $resolvedPath
    if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
        [System.IO.Directory]::CreateDirectory($parent) | Out-Null
    }
    if ([System.IO.Path]::GetFullPath($parent).TrimEnd('\') -eq $resolvedRoot) {
        $rootItem = Get-Item -LiteralPath $resolvedRoot -Force
        if (($rootItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "AAB-Build-Root wurde durch einen Reparse Point ersetzt: $resolvedRoot"
        }
    } else {
        Assert-WrnPathHasNoReparsePoints -Directory $parent -AllowedParent $resolvedRoot | Out-Null
    }
    return $resolvedPath
}

function Write-WrnArtifactJournal(
    [Parameter(Mandatory = $true)][string]$JournalPath,
    [Parameter(Mandatory = $true)]$Document,
    [Parameter(Mandatory = $true)][string]$BuildRoot
) {
    $resolvedJournal = Assert-WrnArtifactPathInsideRoot -Path $JournalPath -BuildRoot $BuildRoot
    $temporaryJournal = Join-Path $BuildRoot '.wrn-artifact-transaction.json.new'
    $temporaryJournal = Assert-WrnArtifactPathInsideRoot -Path $temporaryJournal -BuildRoot $BuildRoot
    if (Test-Path -LiteralPath $temporaryJournal) {
        # Ein Hartabbruch während des vorherigen Journal-Writes kann genau
        # diesen festen Companion hinterlassen. Nur eine normale Einzel-Link-
        # Datei im Build-Root darf ersetzt werden.
        Remove-WrnOwnedArtifactFile -Path $temporaryJournal -BuildRoot $BuildRoot
    }
    $bytes = [System.Text.UTF8Encoding]::new($false).GetBytes(($Document | ConvertTo-Json -Depth 8 -Compress))
    $stream = [System.IO.FileStream]::new(
        $temporaryJournal,
        [System.IO.FileMode]::CreateNew,
        [System.IO.FileAccess]::Write,
        [System.IO.FileShare]::None,
        4096,
        [System.IO.FileOptions]::WriteThrough
    )
    try {
        $stream.Write($bytes, 0, $bytes.Length)
        $stream.Flush($true)
    } finally {
        $stream.Dispose()
    }
    Get-WrnFileIdentity -Path $temporaryJournal | Out-Null
    [System.IO.File]::Move($temporaryJournal, $resolvedJournal, $true)
    Get-WrnFileIdentity -Path $resolvedJournal | Out-Null
}

function New-WrnArtifactJournalDocument(
    [Parameter(Mandatory = $true)][string]$BuildRoot,
    [Parameter(Mandatory = $true)][string]$Token,
    [Parameter(Mandatory = $true)][string]$Phase,
    [Parameter(Mandatory = $true)]$Entries
) {
    return [ordered]@{
        schemaVersion = 1
        buildRoot = $BuildRoot
        token = $Token
        phase = $Phase
        updatedAt = (Get-Date).ToUniversalTime().ToString('o')
        entries = @($Entries | ForEach-Object {
            [ordered]@{
                name = $_.Name
                finalPath = $_.FinalPath
                temporaryPath = $_.TemporaryPath
                identity = if ($null -eq $_.Identity) { $null } else {
                    [ordered]@{
                        length = [long]$_.Identity.Length
                        sha256 = [string]$_.Identity.Sha256
                    }
                }
                published = [bool]$_.PublishedByThisCall
            }
        })
    }
}

function Remove-WrnOwnedArtifactFile(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$BuildRoot,
    $Identity
) {
    $resolvedPath = Assert-WrnArtifactPathInsideRoot -Path $Path -BuildRoot $BuildRoot
    if (-not (Test-Path -LiteralPath $resolvedPath)) { return }
    if (-not (Test-Path -LiteralPath $resolvedPath -PathType Leaf)) {
        throw "Bereinigung abgelehnt; Pfad ist keine Datei: $resolvedPath"
    }
    $actual = Get-WrnFileIdentity -Path $resolvedPath
    if ($null -ne $Identity -and
        ($actual.Length -ne [long]$Identity.Length -or $actual.Sha256 -ne [string]$Identity.Sha256)) {
        throw "Bereinigung abgelehnt; Dateiidentität stimmt nicht: $resolvedPath"
    }
    [System.IO.File]::Delete($resolvedPath)
}

function Repair-WrnArtifactTransactionState(
    [Parameter(Mandatory = $true)][string]$BuildRoot,
    [Parameter(Mandatory = $true)][string]$JournalPath
) {
    $journalCompanion = Join-Path $BuildRoot '.wrn-artifact-transaction.json.new'
    if (Test-Path -LiteralPath $journalCompanion) {
        Remove-WrnOwnedArtifactFile -Path $journalCompanion -BuildRoot $BuildRoot
    }
    if (-not (Test-Path -LiteralPath $JournalPath)) {
        return [pscustomobject]@{ Status = 'none'; Entries = @() }
    }
    Get-WrnFileIdentity -Path $JournalPath | Out-Null
    try {
        $journal = Get-Content -LiteralPath $JournalPath -Raw -Encoding UTF8 | ConvertFrom-Json
    } catch {
        throw "Recovery-Journal ist nicht parsebar und wird nicht automatisch gelöscht: $JournalPath"
    }
    if ($journal.schemaVersion -ne 1 -or
        [string]$journal.buildRoot -ne $BuildRoot -or
        [string]$journal.token -notmatch '^[0-9a-f]{32}$' -or
        [string]$journal.phase -notin @('preparing', 'prepared', 'committing', 'committed') -or
        @($journal.entries).Count -eq 0) {
        throw "Recovery-Journal ist semantisch ungültig und wird nicht automatisch gelöscht: $JournalPath"
    }

    $recoveryEntries = [System.Collections.Generic.List[object]]::new()
    for ($index = 0; $index -lt @($journal.entries).Count; $index++) {
        $stored = @($journal.entries)[$index]
        $finalPath = Assert-WrnArtifactPathInsideRoot -Path ([string]$stored.finalPath) -BuildRoot $BuildRoot
        $temporaryPath = Assert-WrnArtifactPathInsideRoot -Path ([string]$stored.temporaryPath) -BuildRoot $BuildRoot
        $expectedTemporaryName = ".wrn-publish-$($journal.token)-$index.pending"
        if ((Split-Path -Leaf $temporaryPath) -ne $expectedTemporaryName -or -not [string]$stored.name) {
            throw "Recovery-Journal enthält einen unerwarteten temporären Pfad: $temporaryPath"
        }
        $identity = $stored.identity
        if ($null -ne $identity -and
            ([long]$identity.length -lt 0 -or [string]$identity.sha256 -notmatch '^[0-9A-Fa-f]{64}$')) {
            throw "Recovery-Journal enthält eine ungültige Dateiidentität: $temporaryPath"
        }
        $recoveryEntries.Add([pscustomobject]@{
            Name = [string]$stored.name
            FinalPath = $finalPath
            TemporaryPath = $temporaryPath
            Identity = $identity
        })
    }

    $allCommitted = [string]$journal.phase -eq 'committed'
    foreach ($entry in $recoveryEntries) {
        $hasTemporary = Test-Path -LiteralPath $entry.TemporaryPath
        $hasFinal = Test-Path -LiteralPath $entry.FinalPath
        if ($hasTemporary -and $hasFinal) {
            throw "Recovery blockiert: temporärer und finaler Pfad existieren gleichzeitig für $($entry.Name)."
        }
        if ($hasTemporary) {
            # Der Journalpfad ist zufällig, aufrufgebunden und wurde vor Prepare
            # als frei dokumentiert. Veränderte Bytes dürfen deshalb bereinigt
            # werden, aber nur als normale Einzel-Link-Datei im Build-Root.
            Get-WrnFileIdentity -Path $entry.TemporaryPath | Out-Null
            $allCommitted = $false
        }
        if ($hasFinal) {
            if ($null -eq $entry.Identity -or
                -not (Test-WrnFileMatchesIdentity -Path $entry.FinalPath -Identity $entry.Identity)) {
                throw "Recovery blockiert: finales Artefakt ist fremd oder verändert: $($entry.FinalPath)"
            }
        } else {
            $allCommitted = $false
        }
    }

    if ($allCommitted) {
        Remove-WrnOwnedArtifactFile -Path $JournalPath -BuildRoot $BuildRoot
        return [pscustomobject]@{ Status = 'completed'; Entries = @($recoveryEntries) }
    }

    foreach ($entry in @($recoveryEntries | Sort-Object FinalPath -Descending)) {
        if (Test-Path -LiteralPath $entry.FinalPath) {
            Remove-WrnOwnedArtifactFile -Path $entry.FinalPath -BuildRoot $BuildRoot -Identity $entry.Identity
        }
        if (Test-Path -LiteralPath $entry.TemporaryPath) {
            Remove-WrnOwnedArtifactFile -Path $entry.TemporaryPath -BuildRoot $BuildRoot
        }
    }
    Remove-WrnOwnedArtifactFile -Path $JournalPath -BuildRoot $BuildRoot
    return [pscustomobject]@{ Status = 'rolled-back'; Entries = @($recoveryEntries) }
}

function Enter-WrnArtifactTransactionLock(
    [Parameter(Mandatory = $true)][string]$BuildRoot
) {
    $lockPath = Assert-WrnArtifactPathInsideRoot -Path (Join-Path $BuildRoot '.wrn-artifact-transaction.lock') -BuildRoot $BuildRoot
    try {
        $stream = [System.IO.FileStream]::new(
            $lockPath,
            [System.IO.FileMode]::OpenOrCreate,
            [System.IO.FileAccess]::ReadWrite,
            [System.IO.FileShare]::None
        )
    } catch {
        throw "AAB-Artefakttransaktion ist bereits gesperrt: $lockPath"
    }
    try {
        $item = Get-Item -LiteralPath $lockPath -Force
        if ($item.PSIsContainer -or
            ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Transaktions-Lock ist keine normale Datei: $lockPath"
        }
        Initialize-WrnNativeFileInspection
        $linkCount = [WrnReleaseNative.FileInspection]::GetLinkCount($stream.SafeFileHandle)
        if ($linkCount -ne 1) {
            throw "Transaktions-Lock besitzt $linkCount Hardlinks und wird abgelehnt: $lockPath"
        }
        return [pscustomobject]@{ Path = $lockPath; Stream = $stream }
    } catch {
        $stream.Dispose()
        throw
    }
}

function Repair-WrnArtifactTransaction {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$BuildRoot)
    $resolvedRoot = Get-WrnArtifactBuildRoot -BuildRoot $BuildRoot
    $journalPath = Join-Path $resolvedRoot '.wrn-artifact-transaction.json'
    $lock = Enter-WrnArtifactTransactionLock -BuildRoot $resolvedRoot
    try {
        return Repair-WrnArtifactTransactionState -BuildRoot $resolvedRoot -JournalPath $journalPath
    } finally {
        $lock.Stream.Dispose()
        try { Remove-WrnOwnedArtifactFile -Path $lock.Path -BuildRoot $resolvedRoot } catch { }
    }
}

function Invoke-WrnArtifactTransaction {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][array]$Artifacts,
        [Parameter(Mandatory = $true)][string]$BuildRoot,
        [Parameter(Mandatory = $true)][scriptblock]$Prepare,
        [Parameter(Mandatory = $true)][scriptblock]$Validate,
        [scriptblock]$TestHook
    )
    if ($Artifacts.Count -eq 0) { throw 'Artefakttransaktion benötigt mindestens ein Artefakt.' }
    $resolvedRoot = Get-WrnArtifactBuildRoot -BuildRoot $BuildRoot
    $journalPath = Join-Path $resolvedRoot '.wrn-artifact-transaction.json'
    $lock = Enter-WrnArtifactTransactionLock -BuildRoot $resolvedRoot
    $token = [guid]::NewGuid().ToString('N')
    $entries = [System.Collections.Generic.List[object]]::new()
    $finalPaths = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    $validation = $null
    $journalStarted = $false
    try {
        Repair-WrnArtifactTransactionState -BuildRoot $resolvedRoot -JournalPath $journalPath | Out-Null
        for ($index = 0; $index -lt $Artifacts.Count; $index++) {
            $artifact = $Artifacts[$index]
            $name = [string]$artifact.Name
            if (-not $name) { throw "Artefakt $index hat keinen Namen." }
            $finalPath = Assert-WrnArtifactPathInsideRoot -Path ([string]$artifact.FinalPath) -BuildRoot $resolvedRoot
            if (-not $finalPaths.Add($finalPath)) { throw "Doppelter finaler Artefaktpfad: $finalPath" }
            if (Test-Path -LiteralPath $finalPath) {
                throw "Finales Transaktionsziel existiert bereits und wird nicht überschrieben: $finalPath"
            }
            $temporaryPath = Assert-WrnArtifactPathInsideRoot `
                -Path (Join-Path (Split-Path -Parent $finalPath) ".wrn-publish-$token-$index.pending") `
                -BuildRoot $resolvedRoot
            if (Test-Path -LiteralPath $temporaryPath) {
                throw "Aufrufgebundener temporärer Artefaktpfad existiert unerwartet: $temporaryPath"
            }
            $entries.Add([pscustomobject]@{
                Name = $name
                FinalPath = $finalPath
                TemporaryPath = $temporaryPath
                Identity = $null
                PublishedByThisCall = $false
            })
        }

        Write-WrnArtifactJournal -JournalPath $journalPath -BuildRoot $resolvedRoot `
            -Document (New-WrnArtifactJournalDocument -BuildRoot $resolvedRoot -Token $token -Phase 'preparing' -Entries $entries)
        $journalStarted = $true
        if ($TestHook) { & $TestHook 'BeforePrepare' -1 $entries }
        & $Prepare $entries
        if ($TestHook) { & $TestHook 'AfterPrepare' -1 $entries }

        foreach ($entry in $entries) {
            Assert-WrnArtifactPathInsideRoot -Path $entry.TemporaryPath -BuildRoot $resolvedRoot | Out-Null
            if (-not (Test-Path -LiteralPath $entry.TemporaryPath -PathType Leaf)) {
                throw "Temporäres Transaktionsartefakt fehlt: $($entry.Name)"
            }
            $entry.Identity = Get-WrnFileIdentity -Path $entry.TemporaryPath
        }
        Write-WrnArtifactJournal -JournalPath $journalPath -BuildRoot $resolvedRoot `
            -Document (New-WrnArtifactJournalDocument -BuildRoot $resolvedRoot -Token $token -Phase 'prepared' -Entries $entries)

        $validation = & $Validate $entries
        if ($TestHook) { & $TestHook 'AfterValidate' -1 $entries }
        foreach ($entry in $entries) {
            if (-not (Test-WrnFileMatchesIdentity -Path $entry.TemporaryPath -Identity $entry.Identity)) {
                throw "Temporäres Transaktionsartefakt wurde während der Prüfung verändert: $($entry.Name)"
            }
            if (Test-Path -LiteralPath $entry.FinalPath) {
                throw "Finales Ziel entstand während der Prüfung und wird nicht überschrieben: $($entry.FinalPath)"
            }
        }

        if ($TestHook) { & $TestHook 'BeforeCommitValidation' -1 $entries }
        $validation = & $Validate $entries
        foreach ($candidate in $entries) {
            if (-not (Test-WrnFileMatchesIdentity -Path $candidate.TemporaryPath -Identity $candidate.Identity)) {
                throw "Temporäres Transaktionsartefakt wurde unmittelbar vor der Commitphase verändert: $($candidate.Name)"
            }
        }
        if ($TestHook) { & $TestHook 'AfterCommitValidation' -1 $entries }
        Write-WrnArtifactJournal -JournalPath $journalPath -BuildRoot $resolvedRoot `
            -Document (New-WrnArtifactJournalDocument -BuildRoot $resolvedRoot -Token $token -Phase 'committing' -Entries $entries)

        for ($index = 0; $index -lt $entries.Count; $index++) {
            $entry = $entries[$index]
            if ($TestHook) { & $TestHook 'BeforeFinalMove' $index $entries }
            foreach ($candidate in $entries) {
                $candidatePath = if ($candidate.PublishedByThisCall) { $candidate.FinalPath } else { $candidate.TemporaryPath }
                Assert-WrnArtifactPathInsideRoot -Path $candidatePath -BuildRoot $resolvedRoot | Out-Null
                if (-not (Test-WrnFileMatchesIdentity -Path $candidatePath -Identity $candidate.Identity)) {
                    throw "Transaktionsartefakt wurde nach der letzten Gesamtvalidierung verändert: $($candidate.Name)"
                }
                if (-not $candidate.PublishedByThisCall -and (Test-Path -LiteralPath $candidate.FinalPath)) {
                    throw "Finales Ziel entstand unmittelbar vor der Veröffentlichung und wird nicht überschrieben: $($candidate.FinalPath)"
                }
            }
            [System.IO.File]::Move($entry.TemporaryPath, $entry.FinalPath)
            $entry.PublishedByThisCall = $true
            Write-WrnArtifactJournal -JournalPath $journalPath -BuildRoot $resolvedRoot `
                -Document (New-WrnArtifactJournalDocument -BuildRoot $resolvedRoot -Token $token -Phase 'committing' -Entries $entries)
            if ($TestHook) { & $TestHook 'AfterFinalMove' $index $entries }
        }

        Write-WrnArtifactJournal -JournalPath $journalPath -BuildRoot $resolvedRoot `
            -Document (New-WrnArtifactJournalDocument -BuildRoot $resolvedRoot -Token $token -Phase 'committed' -Entries $entries)
        if ($TestHook) { & $TestHook 'AfterJournalCommitted' -1 $entries }
        Remove-WrnOwnedArtifactFile -Path $journalPath -BuildRoot $resolvedRoot
        $journalStarted = $false
        return [pscustomobject]@{ Entries = @($entries); Validation = $validation }
    } catch {
        $originalError = $_
        $rollbackErrors = [System.Collections.Generic.List[string]]::new()
        for ($rollbackIndex = $entries.Count - 1; $rollbackIndex -ge 0; $rollbackIndex--) {
            $entry = $entries[$rollbackIndex]
            foreach ($candidate in @(
                [pscustomobject]@{ Path = $entry.FinalPath; Identity = $entry.Identity },
                [pscustomobject]@{ Path = $entry.TemporaryPath; Identity = $null }
            )) {
                if (-not $candidate.Path -or -not (Test-Path -LiteralPath $candidate.Path)) { continue }
                try {
                    Remove-WrnOwnedArtifactFile -Path $candidate.Path -BuildRoot $resolvedRoot -Identity $candidate.Identity
                } catch {
                    $rollbackErrors.Add("Sichere Rücknahme abgelehnt für $($candidate.Path): $($_.Exception.Message)")
                }
            }
        }
        if ($journalStarted -and $rollbackErrors.Count -eq 0 -and (Test-Path -LiteralPath $journalPath)) {
            try {
                Remove-WrnOwnedArtifactFile -Path $journalPath -BuildRoot $resolvedRoot
                $journalStarted = $false
            } catch {
                $rollbackErrors.Add("Recovery-Journal konnte nicht sicher entfernt werden: $($_.Exception.Message)")
            }
        }
        if ($rollbackErrors.Count -gt 0) {
            throw "$($originalError.Exception.Message) Rücknahme unvollständig; Recovery-Journal bleibt erhalten: $($rollbackErrors -join '; ')"
        }
        throw $originalError
    } finally {
        $lock.Stream.Dispose()
        try { Remove-WrnOwnedArtifactFile -Path $lock.Path -BuildRoot $resolvedRoot } catch { }
    }
}

function New-WrnVerifiedSignedAab {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string]$InputAab,
        [Parameter(Mandatory = $true)][string]$OutputAab,
        [Parameter(Mandatory = $true)][string]$JarsignerPath,
        [Parameter(Mandatory = $true)][string]$KeytoolPath,
        [Parameter(Mandatory = $true)][string]$Keystore,
        [Parameter(Mandatory = $true)][string]$KeyAlias,
        [Parameter(Mandatory = $true)][string]$ExpectedCertificateSha256,
        [string]$ExpectedInputSha256 = '',
        $ExpectedAssetManifest,
        $ExpectedPayloadManifest
    )
    $inputPath = (Resolve-Path -LiteralPath $InputAab).Path
    $inputLock = [System.IO.FileStream]::new(
        $inputPath,
        [System.IO.FileMode]::Open,
        [System.IO.FileAccess]::Read,
        [System.IO.FileShare]::Read
    )
    try {
        # Der offene Read-only-Handle verweigert paralleles Schreiben, Ersetzen
        # und Löschen bis Signierung und vollständiger Vergleich beendet sind.
        $inputSha256 = if ($ExpectedInputSha256) {
            Assert-WrnAabInputHash -AabPath $inputPath -ExpectedSha256 $ExpectedInputSha256
        } else {
            (Get-FileHash -LiteralPath $inputPath -Algorithm SHA256).Hash
        }
        $expectedManifest = if ($null -ne $ExpectedAssetManifest) {
            $ExpectedAssetManifest
        } else {
            Get-WrnAabWebAssetManifest -AabPath $inputPath
        }
        $expectedPayload = if ($null -ne $ExpectedPayloadManifest) {
            $ExpectedPayloadManifest
        } else {
            Get-WrnAabPayloadManifest -AabPath $inputPath
        }

        $outputPath = [System.IO.Path]::GetFullPath($OutputAab)
        if (Test-Path -LiteralPath $outputPath) {
            throw "Temporäre Signierausgabe existiert bereits: $outputPath"
        }
        $arguments = @('-keystore', $Keystore, '-signedjar', $outputPath)
        if ($env:WRN_KEYSTORE_PASSWORD) { $arguments += @('-storepass:env', 'WRN_KEYSTORE_PASSWORD') }
        if ($env:WRN_KEY_PASSWORD) { $arguments += @('-keypass:env', 'WRN_KEY_PASSWORD') }
        $arguments += @($inputPath, $KeyAlias)
        & $JarsignerPath @arguments | Out-Host
        if ($LASTEXITCODE -ne 0) { throw 'AAB-Signierung ist fehlgeschlagen.' }

        $signature = Assert-WrnAabSignature -AabPath $outputPath -JarsignerPath $JarsignerPath -KeytoolPath $KeytoolPath -ExpectedCertificateSha256 $ExpectedCertificateSha256
        $actualManifest = Get-WrnAabWebAssetManifest -AabPath $outputPath
        $assetDifferences = @(Compare-WrnHashManifest $expectedManifest $actualManifest)
        if ($assetDifferences.Count -gt 0) {
            throw "Signierte AAB enthält $($assetDifferences.Count) abweichende Webpfade."
        }
        $actualPayload = Get-WrnAabPayloadManifest -AabPath $outputPath
        $payloadDifferences = @(Compare-WrnHashManifest $expectedPayload $actualPayload)
        if ($payloadDifferences.Count -gt 0) {
            throw "Signierte AAB enthält $($payloadDifferences.Count) abweichende Payload-Pfade."
        }
        return [pscustomobject]@{
            InputSha256 = $inputSha256
            OutputSha256 = (Get-FileHash -LiteralPath $outputPath -Algorithm SHA256).Hash
            Signature = $signature
            AssetDifferences = $assetDifferences
            PayloadDifferences = $payloadDifferences
        }
    } finally {
        $inputLock.Dispose()
    }
}
