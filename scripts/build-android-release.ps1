[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$AndroidProject,

    [string]$Commit = "origin/main",
    [int]$VersionCode = 0,
    [string]$VersionName = "",

    [string]$Keystore = "",

    [string]$KeyAlias = "WRN_KEY",
    [string]$ExpectedCertificateSha256 = "7E4E000A93698A50DBF331A8C6931A0A276830BF34D24E3B50F9734DF82D79A8",
    [string]$OutputDirectory = "",
    [switch]$SkipFetch,
    [switch]$UseWorkingTree,
    [switch]$OfflineGradle,
    [switch]$Unsigned
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot 'wrn-aab-release-helpers.ps1')

function Resolve-RequiredPath([string]$Path, [string]$Label) {
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "$Label wurde nicht gefunden: $Path"
    }
    return (Resolve-Path -LiteralPath $Path).Path
}

function Get-WebVersion([string]$SourceRoot) {
    $newsAppConfig = Join-Path $SourceRoot "news-app-2-config.js"
    $legacyConfig = Join-Path $SourceRoot "config.js"
    $configPath = if (Test-Path -LiteralPath $newsAppConfig) { $newsAppConfig } else { $legacyConfig }
    if (-not (Test-Path -LiteralPath $configPath)) { return "" }
    $content = Get-Content -LiteralPath $configPath -Raw
    $match = [regex]::Match(
        $content,
        "window\.WRN_CONFIG\s*=\s*Object\.freeze\(\{[\s\S]*?\bversion:\s*['""]([^'""]+)"
    )
    if (-not $match.Success) {
        $match = [regex]::Match(
            $content,
            "\bversion:\s*WRN_RELEASE_CHANNEL\s*===\s*['""]production['""]\s*\?\s*['""]([^'""]+)"
        )
    }
    return $(if ($match.Success) { $match.Groups[1].Value } else { "" })
}

function Set-AndroidVersion(
    [string]$BuildGradle,
    [int]$RequestedCode,
    [string]$RequestedName
) {
    $content = Get-Content -LiteralPath $BuildGradle -Raw
    $codeMatch = [regex]::Match($content, "versionCode\s+(\d+)")
    $nameMatch = [regex]::Match($content, 'versionName\s+"([^"]+)"')
    if (-not $codeMatch.Success -or -not $nameMatch.Success) {
        throw "versionCode/versionName konnten in $BuildGradle nicht gelesen werden."
    }
    $oldCode = [int]$codeMatch.Groups[1].Value
    $nextCode = if ($RequestedCode -gt 0) { $RequestedCode } else { $oldCode + 1 }
    if ($nextCode -lt $oldCode) {
        throw "Der Versionscode ($nextCode) darf den vorhandenen Code ($oldCode) nicht unterschreiten."
    }
    $nextName = if ($RequestedName) { $RequestedName } else { $nameMatch.Groups[1].Value }
    $content = [regex]::Replace($content, "versionCode\s+\d+", "versionCode $nextCode", 1)
    $content = [regex]::Replace($content, 'versionName\s+"[^"]+"', "versionName `"$nextName`"", 1)
    [System.IO.File]::WriteAllText($BuildGradle, $content, [System.Text.UTF8Encoding]::new($false))
    return [pscustomobject]@{ code = $nextCode; name = $nextName; previousCode = $oldCode }
}

function Find-JavaTool([string]$Name) {
    $candidates = @()
    if ($env:JAVA_HOME) {
        $candidates += (Join-Path $env:JAVA_HOME "bin\$Name.exe")
    }
    $candidates += "C:\Program Files\Android\Android Studio\jbr\bin\$Name.exe"
    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath $candidate) { return $candidate }
    }
    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }
    throw "$Name wurde nicht gefunden. Android Studio oder ein JDK wird benötigt."
}

function Assert-AndroidSplashTransition(
    [string]$StylesXml,
    [string]$MainActivity
) {
    $styles = Get-Content -LiteralPath $StylesXml -Raw
    $activity = Get-Content -LiteralPath $MainActivity -Raw
    if ($styles -notmatch '<item\s+name="postSplashScreenTheme">@style/AppTheme\.NoActionBar</item>') {
        throw "Android-Starttheme hat kein postSplashScreenTheme. Der Splash-Screen könnte die App bis zur ersten Interaktion abdunkeln."
    }
    if ($activity -notmatch 'SplashScreen\.installSplashScreen\(this\);') {
        throw "MainActivity installiert den Android-Splash-Screen nicht vor super.onCreate()."
    }
}

function Assert-AndroidFileProviderPaths(
    [string]$FilePathsXml,
    [string]$ManifestXml
) {
    $paths = Get-Content -LiteralPath $FilePathsXml -Raw
    $manifest = Get-Content -LiteralPath $ManifestXml -Raw
    if ($paths -match '<external-path\b') {
        throw "Unsichere FileProvider-Freigabe: external-path darf nicht den allgemeinen externen Speicher öffnen."
    }
    foreach ($requiredPath in @('cache-path', 'external-cache-path', 'files-path', 'external-files-path')) {
        if ($paths -notmatch "<$requiredPath\b") {
            throw "FileProvider-Pfad fehlt: $requiredPath"
        }
    }
    if ($manifest -notmatch 'android:exported="false"' -or
        $manifest -notmatch 'android:grantUriPermissions="true"') {
        throw "Der Android-FileProvider ist nicht sicher als nicht exportiert mit temporären URI-Rechten konfiguriert."
    }
    if ($manifest -notmatch 'android:usesCleartextTraffic="false"') {
        throw "Android muss unverschlüsselte Netzwerkverbindungen ausdrücklich blockieren."
    }
}

$repoRoot = (git rev-parse --show-toplevel).Trim()
if (-not $repoRoot) { throw "Dieses Skript muss innerhalb des WRN-Git-Repositories laufen." }
if ($Unsigned -and $Keystore) {
    throw "-Unsigned darf keinen Keystore erhalten. Private Schlüssel gehören nicht in den unsignierten Prüfpfad."
}
$androidRoot = Resolve-RequiredPath $AndroidProject "Android-Projekt"
$keystorePath = if ($Unsigned) {
    ""
} else {
    if (-not $Keystore) { throw "Für einen signierten Build ist -Keystore erforderlich. Für einen rein unsignierten Kandidaten verwende -Unsigned." }
    Resolve-RequiredPath $Keystore "Keystore"
}
$capacitorConfig = Resolve-RequiredPath (Join-Path $androidRoot "capacitor.config.json") "Capacitor-Konfiguration"
$androidDirectory = Resolve-RequiredPath (Join-Path $androidRoot "android") "Android-Verzeichnis"
$buildGradle = Resolve-RequiredPath (Join-Path $androidDirectory "app\build.gradle") "App build.gradle"
$stylesXml = Resolve-RequiredPath (Join-Path $androidDirectory "app\src\main\res\values\styles.xml") "Android styles.xml"
$mainActivity = Resolve-RequiredPath (Join-Path $androidDirectory "app\src\main\java\com\world\revolution\MainActivity.java") "Android MainActivity"
$filePathsXml = Resolve-RequiredPath (Join-Path $androidDirectory "app\src\main\res\xml\file_paths.xml") "Android FileProvider-Pfade"
$manifestXml = Resolve-RequiredPath (Join-Path $androidDirectory "app\src\main\AndroidManifest.xml") "Android Manifest"
Assert-AndroidSplashTransition $stylesXml $mainActivity
Assert-AndroidFileProviderPaths $filePathsXml $manifestXml

if (-not $OutputDirectory) {
    $OutputDirectory = Join-Path $repoRoot "outputs"
}
[System.IO.Directory]::CreateDirectory($OutputDirectory) | Out-Null
$outputRoot = (Resolve-Path -LiteralPath $OutputDirectory).Path

$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("wrn-release-" + [guid]::NewGuid().ToString("N"))
$sourceRoot = Join-Path $temporaryRoot "source"
$unpackRoot = Join-Path $temporaryRoot "aab"
[System.IO.Directory]::CreateDirectory($temporaryRoot) | Out-Null

$report = [ordered]@{
    schemaVersion = 1
    startedAt = (Get-Date).ToUniversalTime().ToString("o")
    requestedCommit = $Commit
    sourceMode = $(if ($UseWorkingTree) { "working-tree" } else { "git-commit" })
    artifactMode = $(if ($Unsigned) { "unsigned-candidate" } else { "signed-release" })
    resolvedCommit = ""
    sourceHeadCommit = ""
    sourceTreeClean = $false
    sourceByteProvenance = "pending"
    versionCode = 0
    versionName = ""
    capacitorSync = "pending"
    androidSplashTransitionVerified = $true
    androidFileProviderVerified = $true
    sourceFileCount = 0
    preBuildDifferences = @()
    packagedDifferences = @()
    signatureVerified = $false
    certificateSha256 = ""
    releaseReady = $false
    aab = ""
    inputAabSha256 = ""
    signedAabSha256 = ""
    aabSha256 = ""
    error = ""
}

try {
    if ($UseWorkingTree) {
        $headCommit = (git rev-parse HEAD).Trim()
        if (-not $headCommit) { throw "Der aktuelle Git-Commit konnte nicht ermittelt werden." }
        $resolvedCommit = "working-tree"
        $report.sourceHeadCommit = $headCommit
        $report.sourceTreeClean = @((git status --porcelain)).Count -eq 0
        $report.sourceByteProvenance = "Aktuelle Arbeitsbaum-Bytes; nicht als byteidentisch mit einem Git-Commit attestiert. Git-Filter und Zeilenendennormalisierung können vom Commit-Blob abweichen."
        $sourceRoot = $repoRoot
    } else {
        if (-not $SkipFetch) {
            git fetch origin main | Out-Host
        }
        $resolvedCommit = (git rev-parse "$Commit^{commit}").Trim()
        if (-not $resolvedCommit) { throw "Git-Commit konnte nicht aufgelöst werden: $Commit" }
        $report.resolvedCommit = $resolvedCommit
        $report.sourceHeadCommit = $resolvedCommit
        $report.sourceTreeClean = $true
        $report.sourceByteProvenance = "Bytes aus einem detached Checkout des vollständigen Commits nach den konfigurierten Git-Filtern und der Zeilenendennormalisierung; Raw-Blob-Byteidentität wird nicht behauptet."
        git worktree add --detach $sourceRoot $resolvedCommit | Out-Host
    }
    $sourceManifest = Get-WrnWebAssetManifest -Root $sourceRoot -SourceRepository
    $report.sourceFileCount = $sourceManifest.Count

    $capacitor = Get-Content -LiteralPath $capacitorConfig -Raw | ConvertFrom-Json
    $webDirName = [string]$capacitor.webDir
    if (-not $webDirName) { $webDirName = "www" }
    $webRoot = Join-Path $androidRoot $webDirName
    $resolvedWebRoot = Clear-WrnWebDirectory -WebRoot $webRoot -AndroidRoot $androidRoot
    Copy-WrnWebAssets -SourceRoot $sourceRoot -WebRoot $resolvedWebRoot

    $copiedManifest = Get-WrnWebAssetManifest -Root $resolvedWebRoot
    $preBuildDifferences = @(Compare-WrnHashManifest $sourceManifest $copiedManifest)
    $report.preBuildDifferences = $preBuildDifferences
    if ($preBuildDifferences.Count) {
        throw "Webdateien unterscheiden sich bereits vor Capacitor Sync."
    }

    $webVersion = Get-WebVersion $sourceRoot
    $effectiveVersionName = if ($VersionName) { $VersionName } else { $webVersion }
    $version = Set-AndroidVersion $buildGradle $VersionCode $effectiveVersionName
    if ($webVersion -and $version.name -ne $webVersion) {
        throw "Android-Version $($version.name) stimmt nicht mit der Webversion $webVersion überein."
    }
    $report.versionCode = $version.code
    $report.versionName = $version.name

    Push-Location $androidRoot
    try {
        if (Test-Path -LiteralPath (Join-Path $androidRoot "node_modules\@capacitor\cli")) {
            $localCap = Join-Path $androidRoot "node_modules\.bin\cap.cmd"
            if (Test-Path -LiteralPath $localCap) {
                & $localCap sync android
                $report.capacitorSync = "node_modules/.bin/cap sync android"
            } else {
                & npm.cmd run sync:android
                $report.capacitorSync = "npm run sync:android"
            }
            if ($LASTEXITCODE -ne 0) { throw "Capacitor Sync ist fehlgeschlagen." }
            Assert-AndroidFileProviderPaths $filePathsXml $manifestXml
        } else {
            throw "Capacitor CLI fehlt. Führe im Android-Projekt zuerst npm ci aus."
        }
    } finally {
        Pop-Location
    }

    $gradle = Join-Path $androidDirectory "gradlew.bat"
    if (-not (Test-Path -LiteralPath $gradle)) {
        throw "Gradle Wrapper wurde nicht gefunden: $gradle"
    }
    if (-not $env:JAVA_HOME) {
        $java = Find-JavaTool "java"
        $env:JAVA_HOME = Split-Path -Parent (Split-Path -Parent $java)
    }
    Push-Location $androidDirectory
    try {
        $gradleArguments = @('lintRelease', 'testReleaseUnitTest', 'bundleRelease', '--no-daemon')
        if ($OfflineGradle) { $gradleArguments += '--offline' }
        & $gradle @gradleArguments
        if ($LASTEXITCODE -ne 0) { throw "Gradle lintRelease/testReleaseUnitTest/bundleRelease ist fehlgeschlagen." }
    } finally {
        Pop-Location
    }

    $unsignedAab = Resolve-RequiredPath (Join-Path $androidDirectory "app\build\outputs\bundle\release\app-release.aab") "Release AAB"
    $report.inputAabSha256 = (Get-FileHash -LiteralPath $unsignedAab -Algorithm SHA256).Hash
    $commitToken = if ($report.resolvedCommit -match '^[0-9a-fA-F]{7}') {
        $report.resolvedCommit.Substring(0, 7).ToLowerInvariant()
    } else {
        'working-tree'
    }
    $finalName = if ($Unsigned) {
        "WorldRevolutionNews-$($version.name)-code$($version.code)-$commitToken-unsigned.aab"
    } else {
        "WorldRevolutionNews-$($version.name)-code$($version.code).aab"
    }
    $finalAab = Join-Path $outputRoot $finalName
    $reportPath = Join-Path $outputRoot ("release-report-code" + $report.versionCode + ".json")
    $markdownPath = Join-Path $outputRoot ("release-report-code" + $report.versionCode + ".md")
    $jarsigner = if ($Unsigned) { '' } else { Find-JavaTool 'jarsigner' }
    $keytool = if ($Unsigned) { '' } else { Find-JavaTool 'keytool' }
    $transactionState = @{ SigningResult = $null }
    $artifacts = @(
        [pscustomobject]@{ Name = 'Aab'; FinalPath = $finalAab },
        [pscustomobject]@{ Name = 'JsonReport'; FinalPath = $reportPath },
        [pscustomobject]@{ Name = 'MarkdownReport'; FinalPath = $markdownPath }
    )
    $prepare = {
        param($entries)
        $aabEntry = @($entries | Where-Object Name -eq 'Aab')[0]
        $jsonEntry = @($entries | Where-Object Name -eq 'JsonReport')[0]
        $markdownEntry = @($entries | Where-Object Name -eq 'MarkdownReport')[0]
        if ($Unsigned) {
            Copy-Item -LiteralPath $unsignedAab -Destination $aabEntry.TemporaryPath
            $packagedManifest = Get-WrnAabWebAssetManifest -AabPath $aabEntry.TemporaryPath
            $report.packagedDifferences = @(Compare-WrnHashManifest $sourceManifest $packagedManifest)
            if (@($report.packagedDifferences).Count) {
                throw "Die AAB enthält nicht dieselben geprüften Quellbaum-Bytes wie der gewählte $($report.sourceMode)-Stand."
            }
        } else {
            $transactionState.SigningResult = New-WrnVerifiedSignedAab `
                -InputAab $unsignedAab `
                -OutputAab $aabEntry.TemporaryPath `
                -JarsignerPath $jarsigner `
                -KeytoolPath $keytool `
                -Keystore $keystorePath `
                -KeyAlias $KeyAlias `
                -ExpectedCertificateSha256 $ExpectedCertificateSha256 `
                -ExpectedAssetManifest $sourceManifest
            $signature = $transactionState.SigningResult.Signature
            $signature.JarsignerOutput | Out-Host
            $signature.KeytoolOutput | Out-Host
            $report.packagedDifferences = @($transactionState.SigningResult.AssetDifferences)
            $report.signatureVerified = $true
            $report.certificateSha256 = $signature.ActualCertificateSha256
            $report.signedAabSha256 = $transactionState.SigningResult.OutputSha256
        }

        $report.aab = $finalAab
        $report.aabSha256 = (Get-FileHash -LiteralPath $aabEntry.TemporaryPath -Algorithm SHA256).Hash
        $report.releaseReady = $report.signatureVerified -and @($report.packagedDifferences).Count -eq 0
        $report.completedAt = (Get-Date).ToUniversalTime().ToString('o')
        $report.status = 'passed'
        $report.error = ''
        $report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $jsonEntry.TemporaryPath -Encoding UTF8
        @(
            '# World Revolution News – Android-Prüfbericht',
            '',
            "- Status: **$($report.status)**",
            "- Quellmodus: **$($report.sourceMode)**",
            "- Artefaktmodus: **$($report.artifactMode)**",
            "- Git-Commit: ``$(if ($report.resolvedCommit) { $report.resolvedCommit } else { 'nicht attestiert' })``",
            "- HEAD bei Arbeitsbaum-Build: ``$($report.sourceHeadCommit)``",
            "- Arbeitsbaum sauber: $($report.sourceTreeClean)",
            "- Byte-Provenienz: $($report.sourceByteProvenance)",
            "- Version: **$($report.versionName)** (Code **$($report.versionCode)**)",
            "- Capacitor: $($report.capacitorSync)",
            "- Android-Dateifreigabe gehärtet: $($report.androidFileProviderVerified)",
            "- Webdateien: $($report.sourceFileCount)",
            "- Abweichungen vor dem Build: $(@($report.preBuildDifferences).Count)",
            "- Abweichungen in der AAB: $(@($report.packagedDifferences).Count)",
            "- Signatur geprüft: $($report.signatureVerified)",
            "- Zertifikat-SHA-256: ``$($report.certificateSha256)``",
            "- Release-freigabefähig: $($report.releaseReady)",
            "- AAB: ``$($report.aab)``",
            "- Eingabe-SHA-256: ``$($report.inputAabSha256)``",
            "- Signierte Ausgabe-SHA-256: ``$($report.signedAabSha256)``",
            "- Artefakt-SHA-256: ``$($report.aabSha256)``",
            '',
            $(if ($UseWorkingTree) {
                'Der eingebettete Webstand stimmt rekursiv mit den beim Start gelesenen Arbeitsbaum-Bytes überein. Eine Byteidentität mit HEAD oder einem anderen Git-Commit wird nicht behauptet.'
            } elseif ($report.releaseReady) {
                'Der eingebettete Webstand stimmt rekursiv mit den Bytes des detached Commit-Checkouts nach Git-Filter-/Zeilenendennormalisierung überein und die Signatur wurde vollständig geprüft.'
            } else {
                'Der eingebettete Webstand stimmt rekursiv mit den Bytes des detached Commit-Checkouts nach Git-Filter-/Zeilenendennormalisierung überein. Der Kandidat bleibt bis zur Signatur- und Zertifikatsprüfung gesperrt.'
            })
        ) | Set-Content -LiteralPath $markdownEntry.TemporaryPath -Encoding UTF8
    }
    $validate = {
        param($entries)
        $aabEntry = @($entries | Where-Object Name -eq 'Aab')[0]
        $jsonEntry = @($entries | Where-Object Name -eq 'JsonReport')[0]
        $markdownEntry = @($entries | Where-Object Name -eq 'MarkdownReport')[0]
        $parsed = Get-Content -LiteralPath $jsonEntry.TemporaryPath -Raw | ConvertFrom-Json
        if ($parsed.status -ne 'passed' -or $parsed.aab -ne $finalAab -or
            $parsed.aabSha256 -ne (Get-FileHash -LiteralPath $aabEntry.TemporaryPath -Algorithm SHA256).Hash -or
            @($parsed.packagedDifferences).Count -ne 0 -or
            [bool]$parsed.signatureVerified -ne [bool](-not $Unsigned) -or
            [bool]$parsed.releaseReady -ne [bool](-not $Unsigned)) {
            throw 'Temporärer JSON-Releasebericht ist unvollständig oder widersprüchlich.'
        }
        $markdown = Get-Content -LiteralPath $markdownEntry.TemporaryPath -Raw
        foreach ($requiredText in @('Status: **passed**', "AAB: ``$finalAab``", "Artefakt-SHA-256: ``$($parsed.aabSha256)``")) {
            if (-not $markdown.Contains($requiredText)) {
                throw "Temporärer Markdown-Releasebericht ist unvollständig: $requiredText"
            }
        }
        $packagedManifest = Get-WrnAabWebAssetManifest -AabPath $aabEntry.TemporaryPath
        if (@(Compare-WrnHashManifest $sourceManifest $packagedManifest).Count -ne 0) {
            throw 'Temporäre AAB weicht bei der abschließenden Transaktionsprüfung vom Quellstand ab.'
        }
        if (-not $Unsigned) {
            Assert-WrnAabSignature -AabPath $aabEntry.TemporaryPath -JarsignerPath $jarsigner -KeytoolPath $keytool -ExpectedCertificateSha256 $ExpectedCertificateSha256 | Out-Null
        }
        return $parsed
    }
    Invoke-WrnArtifactTransaction -Artifacts $artifacts -BuildRoot $outputRoot -Prepare $prepare -Validate $validate | Out-Null
} catch {
    $report.completedAt = (Get-Date).ToUniversalTime().ToString("o")
    $report.status = "failed"
    $report.error = $_.Exception.Message
    throw
} finally {
    if (-not $UseWorkingTree -and (Test-Path -LiteralPath $sourceRoot)) {
        git worktree remove --force $sourceRoot 2>$null
    }
    if (Test-Path -LiteralPath $temporaryRoot) {
        Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
    }
}

Write-Host ""
Write-Host $(if ($report.releaseReady) { "Release erfolgreich: $($report.aab)" } else { "Unsignierter Build-Kandidat erfolgreich: $($report.aab)" }) -ForegroundColor Green
Write-Host "Commit: $($report.resolvedCommit)"
Write-Host "Version: $($report.versionName) (Code $($report.versionCode))"
Write-Host "SHA-256: $($report.aabSha256)"
