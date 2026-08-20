$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

. (Join-Path (Split-Path -Parent $PSScriptRoot) 'scripts\wrn-aab-release-helpers.ps1')

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw $Message }
}

function Invoke-TransactionAttempt([string]$CaseRoot, [string]$FailurePoint) {
    $finalAab = Join-Path $CaseRoot 'release.aab'
    $finalJson = Join-Path $CaseRoot 'release-report.json'
    $finalMarkdown = Join-Path $CaseRoot 'release-report.md'
    $artifacts = @(
        [pscustomobject]@{ Name = 'Aab'; FinalPath = $finalAab },
        [pscustomobject]@{ Name = 'JsonReport'; FinalPath = $finalJson },
        [pscustomobject]@{ Name = 'MarkdownReport'; FinalPath = $finalMarkdown }
    )
    $validationState = [pscustomobject]@{ Count = 0 }
    $prepare = {
        param($entries)
        $aab = @($entries | Where-Object Name -eq 'Aab')[0]
        $json = @($entries | Where-Object Name -eq 'JsonReport')[0]
        $markdown = @($entries | Where-Object Name -eq 'MarkdownReport')[0]
        Set-Content -LiteralPath $aab.TemporaryPath -Value 'verified signed-shape test bytes' -Encoding UTF8
        if ($FailurePoint -eq 'AabWrite') { throw 'simulierter Fehler beim Erzeugen der temporären AAB' }
        if ($FailurePoint -eq 'Signature') { throw 'simulierter Signatur-/Zertifikatsfehler' }
        if ($FailurePoint -eq 'Assets') { throw 'simulierter Assetvergleichsfehler' }
        Set-Content -LiteralPath $json.TemporaryPath -Value '{"status":"passed","releaseReady":false}' -Encoding UTF8
        if ($FailurePoint -eq 'ReportWrite') { throw 'simulierter Fehler beim Schreiben des temporären Berichts' }
        Set-Content -LiteralPath $markdown.TemporaryPath -Value 'Status: passed; releaseReady: false' -Encoding UTF8
    }.GetNewClosure()
    $validate = {
        param($entries)
        $validationState.Count++
        if ($FailurePoint -eq 'ReportValidate') { throw 'simulierter Plausibilitätsfehler im Bericht' }
        if ($validationState.Count -gt 1 -and $FailurePoint -eq 'RevalidateHash') { throw 'simulierter Fehler der erneuten Hashprüfung' }
        if ($validationState.Count -gt 1 -and $FailurePoint -eq 'RevalidateSignature') { throw 'simulierter Fehler der erneuten Signatur-/Zertifikatsprüfung' }
        if ($validationState.Count -gt 1 -and $FailurePoint -eq 'RevalidateAssets') { throw 'simulierter Fehler der erneuten Assetprüfung' }
        $json = @($entries | Where-Object Name -eq 'JsonReport')[0]
        $markdown = @($entries | Where-Object Name -eq 'MarkdownReport')[0]
        $parsed = Get-Content -LiteralPath $json.TemporaryPath -Raw | ConvertFrom-Json
        $text = Get-Content -LiteralPath $markdown.TemporaryPath -Raw
        if ($parsed.status -ne 'passed' -or -not $text.Contains('Status: passed')) {
            throw 'Temporäre Testberichte sind nicht plausibel.'
        }
        return [pscustomobject]@{ Valid = $true }
    }.GetNewClosure()
    $hook = {
        param($stage, $index, $entries)
        if ($stage -eq 'BeforeFinalMove' -and $FailurePoint -eq 'SecondMove' -and $index -eq 1) {
            throw 'simulierter Fehler beim zweiten finalen Move'
        }
        if ($stage -eq 'BeforeFinalMove' -and $FailurePoint -eq 'ThirdMove' -and $index -eq 2) {
            throw 'simulierter Fehler beim dritten finalen Move'
        }
        if ($stage -eq 'BeforeFinalMove' -and $FailurePoint -eq 'ConcurrentTarget' -and $index -eq 1) {
            Set-Content -LiteralPath $entries[$index].FinalPath -Value 'foreign concurrent report' -Encoding UTF8
        }
        if ($stage -eq 'AfterCommitValidation' -and $FailurePoint -eq 'ManipulateAab') {
            Add-Content -LiteralPath $entries[0].TemporaryPath -Value 'manipulated after validation' -Encoding UTF8
        }
        if ($stage -eq 'AfterCommitValidation' -and $FailurePoint -eq 'ManipulateReport') {
            Set-Content -LiteralPath $entries[1].TemporaryPath -Value '{"status":"tampered","releaseReady":true}' -Encoding UTF8
        }
    }.GetNewClosure()
    return Invoke-WrnArtifactTransaction -Artifacts $artifacts -BuildRoot $CaseRoot -Prepare $prepare -Validate $validate -TestHook $hook
}

function Invoke-CrashChild([string]$CaseRoot, [string]$CrashPoint) {
    $pwsh = (Get-Process -Id $PID).Path
    $child = Join-Path $PSScriptRoot 'aab-crash-child.ps1'
    & $pwsh -NoLogo -NoProfile -File $child -CaseRoot $CaseRoot -CrashPoint $CrashPoint 2>$null
    return $LASTEXITCODE
}

$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('wrn-artifact-transaction-' + [guid]::NewGuid().ToString('N'))
try {
    [System.IO.Directory]::CreateDirectory($temporaryRoot) | Out-Null

    $successRoot = Join-Path $temporaryRoot 'Success'
    [System.IO.Directory]::CreateDirectory($successRoot) | Out-Null
    $success = Invoke-TransactionAttempt -CaseRoot $successRoot -FailurePoint ''
    Assert-True $success.Validation.Valid 'Normaler Erfolgsfall lieferte keine erfolgreiche Abschlussvalidierung.'
    Assert-True (@(Get-ChildItem -LiteralPath $successRoot -File).Count -eq 3) 'Normaler Erfolgsfall veröffentlichte nicht genau alle drei zusammengehörigen Artefakte.'
    Assert-True (@(Get-ChildItem -LiteralPath $successRoot -Filter '.wrn-publish-*.pending' -Force).Count -eq 0) 'Normaler Erfolgsfall hinterließ temporäre Dateien.'

    foreach ($failurePoint in @(
        'AabWrite', 'Signature', 'Assets', 'ReportWrite', 'ReportValidate',
        'ManipulateAab', 'ManipulateReport', 'RevalidateHash',
        'RevalidateSignature', 'RevalidateAssets',
        'SecondMove', 'ThirdMove', 'ConcurrentTarget'
    )) {
        $caseRoot = Join-Path $temporaryRoot $failurePoint
        [System.IO.Directory]::CreateDirectory($caseRoot) | Out-Null
        $foreignFile = Join-Path $caseRoot 'foreign-user-file.txt'
        Set-Content -LiteralPath $foreignFile -Value 'must remain unchanged' -Encoding UTF8

        $failed = $false
        try {
            Invoke-TransactionAttempt -CaseRoot $caseRoot -FailurePoint $failurePoint | Out-Null
        } catch {
            $failed = $true
        }
        Assert-True $failed "Fehlerpunkt $failurePoint wurde nicht ausgelöst."
        Assert-True (-not (Test-Path -LiteralPath (Join-Path $caseRoot 'release.aab'))) "Fehlerpunkt $failurePoint hinterließ eine finale AAB."
        Assert-True (-not (Test-Path -LiteralPath (Join-Path $caseRoot 'release-report.md'))) "Fehlerpunkt $failurePoint hinterließ einen finalen Markdownbericht."
        if ($failurePoint -eq 'ConcurrentTarget') {
            $concurrentReport = Join-Path $caseRoot 'release-report.json'
            Assert-True ((Get-Content -LiteralPath $concurrentReport -Raw).Trim() -eq 'foreign concurrent report') 'Konkurrierend erzeugter fremder Bericht wurde verändert oder gelöscht.'
            Remove-Item -LiteralPath $concurrentReport -Force
        } else {
            Assert-True (-not (Test-Path -LiteralPath (Join-Path $caseRoot 'release-report.json'))) "Fehlerpunkt $failurePoint hinterließ einen finalen JSON-Bericht."
        }
        Assert-True (@(Get-ChildItem -LiteralPath $caseRoot -Filter '.wrn-publish-*.pending' -Force).Count -eq 0) "Fehlerpunkt $failurePoint hinterließ bekannte temporäre Dateien."
        Assert-True ((Get-Content -LiteralPath $foreignFile -Raw).Trim() -eq 'must remain unchanged') "Fehlerpunkt $failurePoint veränderte eine fremde Datei."

        $retry = Invoke-TransactionAttempt -CaseRoot $caseRoot -FailurePoint ''
        Assert-True $retry.Validation.Valid "Wiederholungsversuch nach $failurePoint war nicht erfolgreich."
        Assert-True (Test-Path -LiteralPath (Join-Path $caseRoot 'release.aab') -PathType Leaf) "Wiederholungsversuch nach $failurePoint veröffentlichte keine AAB."
        Assert-True (Test-Path -LiteralPath (Join-Path $caseRoot 'release-report.json') -PathType Leaf) "Wiederholungsversuch nach $failurePoint veröffentlichte keinen JSON-Bericht."
        Assert-True (Test-Path -LiteralPath (Join-Path $caseRoot 'release-report.md') -PathType Leaf) "Wiederholungsversuch nach $failurePoint veröffentlichte keinen Markdownbericht."
    }

    $existingRoot = Join-Path $temporaryRoot 'ExistingTarget'
    [System.IO.Directory]::CreateDirectory($existingRoot) | Out-Null
    $existingReport = Join-Path $existingRoot 'release-report.json'
    Set-Content -LiteralPath $existingReport -Value 'foreign existing report' -Encoding UTF8
    $existingRejected = $false
    try { Invoke-TransactionAttempt -CaseRoot $existingRoot -FailurePoint '' | Out-Null } catch { $existingRejected = $_.Exception.Message -match 'existiert bereits' }
    Assert-True $existingRejected 'Vorhandener Zielbericht wurde nicht vor Transaktionsbeginn abgelehnt.'
    Assert-True (-not (Test-Path -LiteralPath (Join-Path $existingRoot 'release.aab'))) 'Vorhandenes Ziel führte zu einer teilweise veröffentlichten AAB.'
    Assert-True ((Get-Content -LiteralPath $existingReport -Raw).Trim() -eq 'foreign existing report') 'Vorhandener fremder Zielbericht wurde verändert.'
    Assert-True (@(Get-ChildItem -LiteralPath $existingRoot -Filter '.wrn-publish-*.pending' -Force).Count -eq 0) 'Vorhandenes Ziel hinterließ temporäre Dateien.'

    foreach ($crashPoint in @('Prepared', 'Validated', 'FirstMove', 'SecondMove')) {
        $crashRoot = Join-Path $temporaryRoot "Crash$crashPoint"
        [System.IO.Directory]::CreateDirectory($crashRoot) | Out-Null
        $exitCode = Invoke-CrashChild -CaseRoot $crashRoot -CrashPoint $crashPoint
        Assert-True ($exitCode -ne 0) "Hartabbruch $crashPoint beendete den Kindprozess nicht."
        Assert-True (Test-Path -LiteralPath (Join-Path $crashRoot '.wrn-artifact-transaction.json')) "Hartabbruch $crashPoint hinterließ kein Recovery-Journal."
        $recovery = Repair-WrnArtifactTransaction -BuildRoot $crashRoot
        Assert-True ($recovery.Status -eq 'rolled-back') "Hartabbruch $crashPoint wurde nicht zurückgerollt."
        Assert-True (@(Get-ChildItem -LiteralPath $crashRoot -Force).Count -eq 0) "Recovery nach $crashPoint hinterließ Dateien."
        $retry = Invoke-TransactionAttempt -CaseRoot $crashRoot -FailurePoint ''
        Assert-True $retry.Validation.Valid "Wiederholung nach Hartabbruch $crashPoint scheiterte."
    }

    $committedCrashRoot = Join-Path $temporaryRoot 'CrashCommitted'
    [System.IO.Directory]::CreateDirectory($committedCrashRoot) | Out-Null
    $committedExit = Invoke-CrashChild -CaseRoot $committedCrashRoot -CrashPoint 'Committed'
    Assert-True ($committedExit -ne 0) 'Hartabbruch nach durablem Commit beendete den Kindprozess nicht.'
    $committedRecovery = Repair-WrnArtifactTransaction -BuildRoot $committedCrashRoot
    Assert-True ($committedRecovery.Status -eq 'completed') 'Vollständig committete Artefakte wurden beim Wiederanlauf nicht als zusammengehörig erkannt.'
    Assert-True (@(Get-ChildItem -LiteralPath $committedCrashRoot -File).Count -eq 3) 'Vollständiger Commit wurde bei Recovery beschädigt.'

    $staleLockRoot = Join-Path $temporaryRoot 'StaleLock'
    [System.IO.Directory]::CreateDirectory($staleLockRoot) | Out-Null
    Set-Content -LiteralPath (Join-Path $staleLockRoot '.wrn-artifact-transaction.lock') -Value 'stale' -Encoding UTF8
    $staleResult = Invoke-TransactionAttempt -CaseRoot $staleLockRoot -FailurePoint ''
    Assert-True $staleResult.Validation.Valid 'Ein nicht mehr geöffneter Lock wurde nicht sicher wiederverwendet.'
    Assert-True (-not (Test-Path -LiteralPath (Join-Path $staleLockRoot '.wrn-artifact-transaction.lock'))) 'Staler Lock wurde nach Erfolg nicht entfernt.'

    $staleCompanionRoot = Join-Path $temporaryRoot 'StaleJournalCompanion'
    [System.IO.Directory]::CreateDirectory($staleCompanionRoot) | Out-Null
    Set-Content -LiteralPath (Join-Path $staleCompanionRoot '.wrn-artifact-transaction.json.new') -Value 'interrupted journal bytes' -Encoding UTF8
    $staleCompanionResult = Invoke-TransactionAttempt -CaseRoot $staleCompanionRoot -FailurePoint ''
    Assert-True $staleCompanionResult.Validation.Valid 'Ein normaler staler Journal-Companion wurde nicht sicher recoverd.'
    Assert-True (-not (Test-Path -LiteralPath (Join-Path $staleCompanionRoot '.wrn-artifact-transaction.json.new'))) 'Staler Journal-Companion blieb nach Erfolg liegen.'

    $linkedCompanionRoot = Join-Path $temporaryRoot 'LinkedJournalCompanion'
    [System.IO.Directory]::CreateDirectory($linkedCompanionRoot) | Out-Null
    $linkedCompanion = Join-Path $linkedCompanionRoot '.wrn-artifact-transaction.json.new'
    $linkedCompanionAlias = Join-Path $linkedCompanionRoot 'journal-alias.bin'
    Set-Content -LiteralPath $linkedCompanion -Value 'linked interrupted journal bytes' -Encoding UTF8
    New-Item -ItemType HardLink -Path $linkedCompanionAlias -Target $linkedCompanion | Out-Null
    $linkedCompanionRejected = $false
    try { Repair-WrnArtifactTransaction -BuildRoot $linkedCompanionRoot | Out-Null } catch { $linkedCompanionRejected = $_.Exception.Message -match 'Hardlinks' }
    Assert-True $linkedCompanionRejected 'Hardlink-Ausleitung des Journal-Companions wurde nicht abgelehnt.'
    Assert-True (Test-Path -LiteralPath $linkedCompanionAlias) 'Journal-Companion-Ausleitung wurde gelöscht.'

    $traversalRoot = Join-Path $temporaryRoot 'Traversal'
    [System.IO.Directory]::CreateDirectory($traversalRoot) | Out-Null
    $outsideTarget = Join-Path $temporaryRoot 'outside-release.aab'
    $traversalRejected = $false
    try {
        Invoke-WrnArtifactTransaction `
            -Artifacts @([pscustomobject]@{ Name = 'Escape'; FinalPath = $outsideTarget }) `
            -BuildRoot $traversalRoot -Prepare { param($entries) } -Validate { param($entries) } | Out-Null
    } catch {
        $traversalRejected = $_.Exception.Message -match 'außerhalb'
    }
    Assert-True $traversalRejected 'Pfadtraversal aus dem Build-Root wurde nicht abgelehnt.'
    Assert-True (-not (Test-Path -LiteralPath $outsideTarget)) 'Pfadtraversal erzeugte eine Datei außerhalb des Build-Roots.'

    $junctionRoot = Join-Path $temporaryRoot 'Junction'
    $junctionOutside = Join-Path $temporaryRoot 'JunctionOutside'
    [System.IO.Directory]::CreateDirectory($junctionRoot) | Out-Null
    [System.IO.Directory]::CreateDirectory($junctionOutside) | Out-Null
    $junctionPath = Join-Path $junctionRoot 'linked-output'
    New-Item -ItemType Junction -Path $junctionPath -Target $junctionOutside | Out-Null
    $junctionRejected = $false
    try {
        Invoke-WrnArtifactTransaction `
            -Artifacts @([pscustomobject]@{ Name = 'JunctionEscape'; FinalPath = (Join-Path $junctionPath 'release.aab') }) `
            -BuildRoot $junctionRoot -Prepare { param($entries) } -Validate { param($entries) } | Out-Null
    } catch {
        $junctionRejected = $_.Exception.Message -match 'Reparse Point'
    }
    Assert-True $junctionRejected 'Junction im Zielpfad wurde nicht abgelehnt.'
    [System.IO.Directory]::Delete($junctionPath, $false)

    $hardlinkRoot = Join-Path $temporaryRoot 'HardlinkCleanup'
    [System.IO.Directory]::CreateDirectory($hardlinkRoot) | Out-Null
    $hardlinkAlias = Join-Path $hardlinkRoot 'external-alias.bin'
    $hardlinkHook = {
        param($stage, $index, $entries)
        if ($stage -eq 'AfterPrepare') {
            New-Item -ItemType HardLink -Path $hardlinkAlias -Target $entries[0].TemporaryPath | Out-Null
        }
    }.GetNewClosure()
    $hardlinkRejected = $false
    try {
        $artifacts = @([pscustomobject]@{ Name = 'Hardlink'; FinalPath = (Join-Path $hardlinkRoot 'release.aab') })
        Invoke-WrnArtifactTransaction -Artifacts $artifacts -BuildRoot $hardlinkRoot `
            -Prepare { param($entries) Set-Content -LiteralPath $entries[0].TemporaryPath -Value 'owned bytes' -Encoding UTF8 } `
            -Validate { param($entries) [pscustomobject]@{ Valid = $true } } -TestHook $hardlinkHook | Out-Null
    } catch {
        $hardlinkRejected = $_.Exception.Message -match 'Hardlinks'
    }
    Assert-True $hardlinkRejected 'Hardlink-Manipulation wurde nicht abgelehnt.'
    Assert-True (Test-Path -LiteralPath $hardlinkAlias) 'Hardlink-Ausleitung wurde durch Cleanup verändert.'
    Assert-True (@(Get-ChildItem -LiteralPath $hardlinkRoot -Filter '.wrn-publish-*.pending' -Force).Count -eq 1) 'Unsicherer Hardlink-Temppfad wurde gelöscht.'
    Remove-Item -LiteralPath $hardlinkAlias -Force
    $hardlinkRecovery = Repair-WrnArtifactTransaction -BuildRoot $hardlinkRoot
    Assert-True ($hardlinkRecovery.Status -eq 'rolled-back') 'Hardlink-Fall ließ sich nach Entfernen der Ausleitung nicht recovern.'
    Assert-True (@(Get-ChildItem -LiteralPath $hardlinkRoot -Force).Count -eq 0) 'Hardlink-Recovery hinterließ Dateien.'

    Write-Host 'Artifact transaction regression: exception rollback, hard-crash recovery, stale-lock restart, root confinement, reparse and hardlink cleanup gates passed.'
} finally {
    $tempPrefix = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd('\') + '\'
    $resolvedTemporaryRoot = [System.IO.Path]::GetFullPath($temporaryRoot)
    if ($resolvedTemporaryRoot.StartsWith($tempPrefix, [System.StringComparison]::OrdinalIgnoreCase) -and
        (Split-Path -Leaf $resolvedTemporaryRoot) -like 'wrn-artifact-transaction-*' -and
        (Test-Path -LiteralPath $resolvedTemporaryRoot)) {
        Remove-Item -LiteralPath $resolvedTemporaryRoot -Recurse -Force
    }
}
