$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

. (Join-Path (Split-Path -Parent $PSScriptRoot) 'scripts\wrn-aab-release-helpers.ps1')

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw $Message }
}

$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('wrn-asset-regression-' + [guid]::NewGuid().ToString('N'))
$sourceRoot = Join-Path $temporaryRoot 'source'
$androidRoot = Join-Path $temporaryRoot 'android-project'
$webRoot = Join-Path $androidRoot 'www'
$junctionPath = $null

try {
    foreach ($directory in @(
        $sourceRoot,
        (Join-Path $sourceRoot 'news-archive'),
        (Join-Path $sourceRoot 'tests'),
        (Join-Path $sourceRoot 'scripts'),
        (Join-Path $sourceRoot 'outputs'),
        (Join-Path $sourceRoot 'cloudflare'),
        (Join-Path $sourceRoot '.tmp'),
        (Join-Path $sourceRoot 'admin'),
        $webRoot,
        (Join-Path $webRoot 'news-archive')
    )) {
        [System.IO.Directory]::CreateDirectory($directory) | Out-Null
    }

    Set-Content -LiteralPath (Join-Path $sourceRoot 'index.html') -Value '<!doctype html>' -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $sourceRoot 'news-archive\current.json') -Value '{"value":1}' -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $sourceRoot 'tests\must-not-ship.js') -Value 'test' -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $sourceRoot 'scripts\must-not-ship.js') -Value 'script' -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $sourceRoot 'outputs\must-not-ship.json') -Value '{}' -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $sourceRoot 'cloudflare\must-not-ship.js') -Value 'worker' -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $sourceRoot '.tmp\must-not-ship.json') -Value '{}' -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $sourceRoot 'admin\must-not-ship.html') -Value 'private' -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $webRoot 'stale.js') -Value 'stale' -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $webRoot 'news-archive\stale.json') -Value '{"stale":true}' -Encoding UTF8

    Clear-WrnWebDirectory -WebRoot $webRoot -AndroidRoot $androidRoot | Out-Null
    Copy-WrnWebAssets -SourceRoot $sourceRoot -WebRoot $webRoot

    Assert-True (Test-Path -LiteralPath (Join-Path $webRoot 'index.html')) 'Root-Asset wurde nicht kopiert.'
    Assert-True (Test-Path -LiteralPath (Join-Path $webRoot 'news-archive\current.json')) 'Rekursives Archiv-Asset wurde nicht kopiert.'
    Assert-True (-not (Test-Path -LiteralPath (Join-Path $webRoot 'stale.js'))) 'Alte Root-Datei hat die sichere Bereinigung überlebt.'
    Assert-True (-not (Test-Path -LiteralPath (Join-Path $webRoot 'news-archive\stale.json'))) 'Alte Archivdatei hat die sichere Bereinigung überlebt.'
    foreach ($excluded in @('tests', 'scripts', 'outputs', 'cloudflare', '.tmp', 'admin')) {
        Assert-True (-not (Test-Path -LiteralPath (Join-Path $webRoot $excluded))) "Entwicklungsverzeichnis wurde als App-Asset kopiert: $excluded"
    }

    $sourceManifest = Get-WrnWebAssetManifest -Root $sourceRoot -SourceRepository
    $targetManifest = Get-WrnWebAssetManifest -Root $webRoot
    Assert-True (@(Compare-WrnHashManifest $sourceManifest $targetManifest).Count -eq 0) 'Frisch kopierter Assetstand weicht ab.'
    Assert-True ($sourceManifest.Contains('news-archive/current.json')) 'Manifest verwendet den rekursiven relativen Pfad nicht.'

    Remove-Item -LiteralPath (Join-Path $webRoot 'news-archive\current.json') -Force
    $missing = @(Compare-WrnHashManifest $sourceManifest (Get-WrnWebAssetManifest -Root $webRoot))
    Assert-True ($missing.Count -eq 1 -and $missing[0].issue -eq 'missing' -and $missing[0].file -eq 'news-archive/current.json') 'Fehlende Archivdatei wurde nicht erkannt.'

    Copy-WrnWebAssets -SourceRoot $sourceRoot -WebRoot $webRoot
    Set-Content -LiteralPath (Join-Path $webRoot 'news-archive\extra.json') -Value '{}' -Encoding UTF8
    $extra = @(Compare-WrnHashManifest $sourceManifest (Get-WrnWebAssetManifest -Root $webRoot))
    Assert-True (@($extra | Where-Object { $_.issue -eq 'unexpected' -and $_.file -eq 'news-archive/extra.json' }).Count -eq 1) 'Zusätzliche Archivdatei wurde nicht erkannt.'

    Remove-Item -LiteralPath (Join-Path $webRoot 'news-archive\extra.json') -Force
    Set-Content -LiteralPath (Join-Path $webRoot 'news-archive\current.json') -Value '{"value":2}' -Encoding UTF8
    $changed = @(Compare-WrnHashManifest $sourceManifest (Get-WrnWebAssetManifest -Root $webRoot))
    Assert-True ($changed.Count -eq 1 -and $changed[0].issue -eq 'changed' -and $changed[0].file -eq 'news-archive/current.json') 'Geänderte Archivdatei wurde nicht erkannt.'

    Remove-Item -LiteralPath $webRoot -Recurse -Force
    $externalRoot = Join-Path $temporaryRoot 'external-junction-target'
    [System.IO.Directory]::CreateDirectory($externalRoot) | Out-Null
    $externalMarker = Join-Path $externalRoot 'must-survive.txt'
    Set-Content -LiteralPath $externalMarker -Value 'outside android project' -Encoding UTF8
    $junctionPath = $webRoot
    New-Item -ItemType Junction -Path $junctionPath -Target $externalRoot | Out-Null

    $junctionRejected = $false
    try {
        Clear-WrnWebDirectory -WebRoot $junctionPath -AndroidRoot $androidRoot | Out-Null
    } catch {
        $junctionRejected = $_.Exception.Message -match 'Reparse Point|Junction|Symlink'
    }
    Assert-True $junctionRejected 'Webverzeichnis-Junction wurde von der sicheren Bereinigung nicht abgelehnt.'
    Assert-True ((Get-Content -LiteralPath $externalMarker -Raw).Trim() -eq 'outside android project') 'Externe Markerdatei wurde über eine Junction verändert.'

    [System.IO.Directory]::Delete($junctionPath, $false)
    $junctionPath = Join-Path $androidRoot 'linked-parent'
    $externalNestedWeb = Join-Path $externalRoot 'nested-www'
    [System.IO.Directory]::CreateDirectory($externalNestedWeb) | Out-Null
    New-Item -ItemType Junction -Path $junctionPath -Target $externalRoot | Out-Null
    $componentRejected = $false
    try {
        Clear-WrnWebDirectory -WebRoot (Join-Path $junctionPath 'nested-www') -AndroidRoot $androidRoot | Out-Null
    } catch {
        $componentRejected = $_.Exception.Message -match 'Reparse Point|Junction|Symlink'
    }
    Assert-True $componentRejected 'Junction in einer vorhandenen Pfadkomponente wurde nicht abgelehnt.'
    Assert-True ((Get-Content -LiteralPath $externalMarker -Raw).Trim() -eq 'outside android project') 'Externe Markerdatei wurde über eine verknüpfte Pfadkomponente verändert.'

    [System.IO.Directory]::Delete($junctionPath, $false)
    [System.IO.Directory]::CreateDirectory($webRoot) | Out-Null
    $localMarker = Join-Path $webRoot 'must-also-survive.txt'
    Set-Content -LiteralPath $localMarker -Value 'local content' -Encoding UTF8
    $junctionPath = Join-Path $webRoot 'linked-external-content'
    New-Item -ItemType Junction -Path $junctionPath -Target $externalRoot | Out-Null
    $descendantRejected = $false
    try {
        Clear-WrnWebDirectory -WebRoot $webRoot -AndroidRoot $androidRoot | Out-Null
    } catch {
        $descendantRejected = $_.Exception.Message -match 'Reparse Point|Junction|Symlink'
    }
    Assert-True $descendantRejected 'Junction innerhalb des Bereinigungsbaums wurde nicht abgelehnt.'
    Assert-True (Test-Path -LiteralPath $localMarker -PathType Leaf) 'Die zweiphasige Prüfung löschte lokale Dateien vor dem Junction-Abbruch.'
    Assert-True ((Get-Content -LiteralPath $externalMarker -Raw).Trim() -eq 'outside android project') 'Externe Markerdatei wurde bei rekursiver Bereinigung verändert.'

    Write-Host 'Android asset regression: missing, unexpected, changed, stale and junction paths detected safely.'
} finally {
    if ($junctionPath -and (Test-Path -LiteralPath $junctionPath)) {
        $junctionItem = Get-Item -LiteralPath $junctionPath -Force
        if (($junctionItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            [System.IO.Directory]::Delete($junctionPath, $false)
        }
    }
    $tempPrefix = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd('\') + '\'
    $resolvedTemporaryRoot = [System.IO.Path]::GetFullPath($temporaryRoot)
    if ($resolvedTemporaryRoot.StartsWith($tempPrefix, [System.StringComparison]::OrdinalIgnoreCase) -and
        (Split-Path -Leaf $resolvedTemporaryRoot) -like 'wrn-asset-regression-*' -and
        (Test-Path -LiteralPath $resolvedTemporaryRoot)) {
        Remove-Item -LiteralPath $resolvedTemporaryRoot -Recurse -Force
    }
}
