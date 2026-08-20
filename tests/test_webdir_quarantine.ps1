$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

. (Join-Path (Split-Path -Parent $PSScriptRoot) 'scripts\wrn-aab-release-helpers.ps1')

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw $Message }
}

function Remove-TestJunction([string]$Path) {
    if (Test-Path -LiteralPath $Path) {
        $item = Get-Item -LiteralPath $Path -Force
        if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            [System.IO.Directory]::Delete($Path, $false)
        }
    }
}

$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('wrn-web-quarantine-' + [guid]::NewGuid().ToString('N'))
$junctions = [System.Collections.Generic.List[string]]::new()
try {
    [System.IO.Directory]::CreateDirectory($temporaryRoot) | Out-Null
    $external = Join-Path $temporaryRoot 'external'
    [System.IO.Directory]::CreateDirectory($external) | Out-Null
    $externalMarker = Join-Path $external 'external-marker.txt'
    Set-Content -LiteralPath $externalMarker -Value 'external unchanged' -Encoding UTF8

    # webDir selbst als Junction.
    $androidSelf = Join-Path $temporaryRoot 'android-self'
    [System.IO.Directory]::CreateDirectory($androidSelf) | Out-Null
    $webSelf = Join-Path $androidSelf 'www'
    New-Item -ItemType Junction -Path $webSelf -Target $external | Out-Null
    $junctions.Add($webSelf)
    $rejected = $false
    try { Clear-WrnWebDirectory -WebRoot $webSelf -AndroidRoot $androidSelf | Out-Null } catch { $rejected = $_.Exception.Message -match 'Reparse Point|Junction|Symlink' }
    Assert-True $rejected 'webDir-Junction wurde nicht abgelehnt.'
    Remove-TestJunction $webSelf

    # Vorhandene Elternkomponente als Junction.
    $androidParent = Join-Path $temporaryRoot 'android-parent'
    [System.IO.Directory]::CreateDirectory($androidParent) | Out-Null
    $linkedParent = Join-Path $androidParent 'linked-parent'
    New-Item -ItemType Junction -Path $linkedParent -Target $external | Out-Null
    $junctions.Add($linkedParent)
    $rejected = $false
    try { Clear-WrnWebDirectory -WebRoot (Join-Path $linkedParent 'www') -AndroidRoot $androidParent | Out-Null } catch { $rejected = $_.Exception.Message -match 'Reparse Point|Junction|Symlink' }
    Assert-True $rejected 'Junction in einer Elternkomponente wurde nicht abgelehnt.'
    Remove-TestJunction $linkedParent

    # Junction im alten Baum wird vor dem Rename abgelehnt.
    $androidChild = Join-Path $temporaryRoot 'android-child'
    $webChild = Join-Path $androidChild 'www'
    [System.IO.Directory]::CreateDirectory($webChild) | Out-Null
    $localMarker = Join-Path $webChild 'local-marker.txt'
    Set-Content -LiteralPath $localMarker -Value 'local unchanged' -Encoding UTF8
    $childJunction = Join-Path $webChild 'linked-external'
    New-Item -ItemType Junction -Path $childJunction -Target $external | Out-Null
    $junctions.Add($childJunction)
    $rejected = $false
    try { Clear-WrnWebDirectory -WebRoot $webChild -AndroidRoot $androidChild | Out-Null } catch { $rejected = $_.Exception.Message -match 'Reparse Point|Junction|Symlink' }
    Assert-True $rejected 'Junction im alten webDir-Baum wurde nicht abgelehnt.'
    Assert-True (Test-Path -LiteralPath $localMarker) 'Lokaler Altbestand wurde trotz Ablehnung verändert.'
    Remove-TestJunction $childJunction

    # Konkurrenzmanipulation nach Vorprüfung: Quarantäne wird zurückgerollt.
    $androidRace = Join-Path $temporaryRoot 'android-race'
    $webRace = Join-Path $androidRace 'www'
    $raceChild = Join-Path $webRace 'replace-me'
    [System.IO.Directory]::CreateDirectory($raceChild) | Out-Null
    $raceMarker = Join-Path $webRace 'original-marker.txt'
    Set-Content -LiteralPath $raceMarker -Value 'restore me' -Encoding UTF8
    $raceJunction = Join-Path $webRace 'replace-me'
    $raceHook = {
        param($stage, $web, $quarantine)
        if ($stage -eq 'BeforeQuarantineMove') {
            [System.IO.Directory]::Delete($raceJunction, $false)
            New-Item -ItemType Junction -Path $raceJunction -Target $external | Out-Null
            $junctions.Add($raceJunction)
        }
    }.GetNewClosure()
    $rejected = $false
    try { Clear-WrnWebDirectory -WebRoot $webRace -AndroidRoot $androidRace -TestHook $raceHook | Out-Null } catch { $rejected = $true }
    Assert-True $rejected 'Simulierte Konkurrenzmanipulation wurde nicht abgelehnt.'
    Assert-True (Test-Path -LiteralPath $raceMarker) 'Ursprünglicher webDir-Baum wurde nach Konkurrenzfehler nicht wiederhergestellt.'
    Assert-True (@(Get-ChildItem -LiteralPath $androidRace -Filter '.wrn-web-quarantine-*.pending' -Force).Count -eq 0) 'Konkurrenzfehler hinterließ eine bekannte Quarantäne.'
    Remove-TestJunction $raceJunction
    Clear-WrnWebDirectory -WebRoot $webRace -AndroidRoot $androidRace | Out-Null

    # Fehler direkt nach Rename muss Originalzustand wiederherstellen.
    $androidRename = Join-Path $temporaryRoot 'android-rename'
    $webRename = Join-Path $androidRename 'www'
    [System.IO.Directory]::CreateDirectory($webRename) | Out-Null
    $renameMarker = Join-Path $webRename 'original-marker.txt'
    Set-Content -LiteralPath $renameMarker -Value 'restore after rename' -Encoding UTF8
    $foreignQuarantine = Join-Path $androidRename '.wrn-web-quarantine-foreign.pending'
    [System.IO.Directory]::CreateDirectory($foreignQuarantine) | Out-Null
    $foreignMarker = Join-Path $foreignQuarantine 'foreign-marker.txt'
    Set-Content -LiteralPath $foreignMarker -Value 'foreign unchanged' -Encoding UTF8
    $renameHook = { param($stage, $web, $quarantine) if ($stage -eq 'AfterQuarantineMove') { throw 'simulierter Fehler direkt nach Rename' } }
    $rejected = $false
    try { Clear-WrnWebDirectory -WebRoot $webRename -AndroidRoot $androidRename -TestHook $renameHook | Out-Null } catch { $rejected = $_.Exception.Message -match 'simulierter Fehler' }
    Assert-True $rejected 'Fehler direkt nach Rename wurde nicht ausgelöst.'
    Assert-True ((Get-Content -LiteralPath $renameMarker -Raw).Trim() -eq 'restore after rename') 'Originalbaum wurde nach Rename-Fehler nicht wiederhergestellt.'
    Assert-True ((Get-Content -LiteralPath $foreignMarker -Raw).Trim() -eq 'foreign unchanged') 'Fremde Quarantäne wurde verändert.'
    Assert-True (@(Get-ChildItem -LiteralPath $androidRename -Filter '.wrn-web-quarantine-*.pending' -Force).Count -eq 1) 'Aufrufgebundene Quarantäne blieb zurück oder fremde Quarantäne wurde entfernt.'
    Clear-WrnWebDirectory -WebRoot $webRename -AndroidRoot $androidRename | Out-Null
    Assert-True ((Get-Content -LiteralPath $foreignMarker -Raw).Trim() -eq 'foreign unchanged') 'Fremde Quarantäne wurde beim Wiederholungsversuch verändert.'

    # Fehler nach dem Erzeugen des neuen leeren webDir stellt ebenfalls zurück.
    $androidFresh = Join-Path $temporaryRoot 'android-fresh'
    $webFresh = Join-Path $androidFresh 'www'
    [System.IO.Directory]::CreateDirectory($webFresh) | Out-Null
    $freshMarker = Join-Path $webFresh 'original-marker.txt'
    Set-Content -LiteralPath $freshMarker -Value 'restore after fresh create' -Encoding UTF8
    $freshHook = { param($stage, $web, $quarantine) if ($stage -eq 'AfterFreshWebCreate') { throw 'simulierter Fehler nach Neuerstellen' } }
    $rejected = $false
    try { Clear-WrnWebDirectory -WebRoot $webFresh -AndroidRoot $androidFresh -TestHook $freshHook | Out-Null } catch { $rejected = $_.Exception.Message -match 'simulierter Fehler' }
    Assert-True $rejected 'Fehler nach dem Neuerstellen wurde nicht ausgelöst.'
    Assert-True ((Get-Content -LiteralPath $freshMarker -Raw).Trim() -eq 'restore after fresh create') 'Originalbaum wurde nach Fehler beim Neuerstellen nicht wiederhergestellt.'
    Assert-True (@(Get-ChildItem -LiteralPath $androidFresh -Filter '.wrn-web-quarantine-*.pending' -Force).Count -eq 0) 'Fehler beim Neuerstellen hinterließ eine bekannte Quarantäne.'
    Clear-WrnWebDirectory -WebRoot $webFresh -AndroidRoot $androidFresh | Out-Null

    Assert-True ((Get-Content -LiteralPath $externalMarker -Raw).Trim() -eq 'external unchanged') 'Externe Markerdatei wurde in einem Quarantänetest verändert.'
    Write-Host 'WebDir quarantine regression: junctions, concurrency and post-rename failures were rejected or restored without touching external or foreign files.'
} finally {
    foreach ($junction in $junctions) { Remove-TestJunction $junction }
    $tempPrefix = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd('\') + '\'
    $resolvedTemporaryRoot = [System.IO.Path]::GetFullPath($temporaryRoot)
    if ($resolvedTemporaryRoot.StartsWith($tempPrefix, [System.StringComparison]::OrdinalIgnoreCase) -and
        (Split-Path -Leaf $resolvedTemporaryRoot) -like 'wrn-web-quarantine-*' -and
        (Test-Path -LiteralPath $resolvedTemporaryRoot)) {
        Remove-Item -LiteralPath $resolvedTemporaryRoot -Recurse -Force
    }
}
