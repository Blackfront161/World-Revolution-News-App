[CmdletBinding()]
param(
    [switch]$PreflightOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$helperScript = Join-Path $PSScriptRoot 'wrn-aab-release-helpers.ps1'
. $helperScript

# Exakt an die zwei unabhaengig reproduzierten Builds des freigegebenen
# Release-Commits gebunden. Ein anderer Kandidat benoetigt einen neuen Signer.
$jarsigner = 'C:\Program Files\Android\Android Studio1\jbr\bin\jarsigner.exe'
$keytool = 'C:\Program Files\Android\Android Studio1\jbr\bin\keytool.exe'
$keystore = 'C:\Users\patri\Desktop\App Entwicklung\Android_Keys\world-revolution.jks'
$releaseDirectory = 'C:\Users\patri\Documents\World Rev Ne\wrn-github-app-current\outputs\roadmap-code33-release\build1'
$peerDirectory = 'C:\Users\patri\Documents\World Rev Ne\wrn-github-app-current\outputs\roadmap-code33-release\build2'
$unsignedAab = Join-Path $releaseDirectory 'WorldRevolutionNews-2.1.2-code33-fb937dd-unsigned.aab'
$peerUnsignedAab = Join-Path $peerDirectory 'WorldRevolutionNews-2.1.2-code33-fb937dd-unsigned.aab'
$buildReport = Join-Path $releaseDirectory 'release-report-code33.json'
$peerBuildReport = Join-Path $peerDirectory 'release-report-code33.json'
$signedAab = Join-Path $releaseDirectory 'WorldRevolutionNews-2.1.2-code33-fb937dd-signed.aab'
$signatureReport = Join-Path $releaseDirectory 'WorldRevolutionNews-2.1.2-code33-fb937dd-signed.signature-report.json'

$expectedSourceCommit = 'fb937dd73355b9bb6f037c2b0e547da9cdb6bbaf'
$expectedVersionName = '2.1.2'
$expectedVersionCode = 33
$expectedSourceFileCount = 356
$expectedAssetCount = 356
$expectedPayloadCount = 802
$expectedUnsignedSha256 = 'A55A3E13AFF32A07D1692B1F6937E1E4F59C4846D990AE191A24F66E53EC385E'
$expectedBuildReportSha256 = '05E83B376C5C1ECBF26687F3D9311F1D0CE83018F106E6C5265569E1666A1F06'
$expectedPeerBuildReportSha256 = 'B99A493B1841B79B2B5EDD0799FFE0395EECEFDF83250975F4B3ECAA02C970CE'
$keyAlias = 'WRN_KEY'
$expectedCertificateSha256 = '7E4E000A93698A50DBF331A8C6931A0A276830BF34D24E3B50F9734DF82D79A8'

# Geerbte Passwoerter sind nie zulaessig. Ausschliesslich der lokale
# Klick-Handler setzt sie kurzzeitig aus den beiden verdeckten GUI-Feldern.
$env:WRN_KEYSTORE_PASSWORD = $null
$env:WRN_KEY_PASSWORD = $null

function Assert-Code33BuildReport {
    param(
        [Parameter(Mandatory = $true)][string]$Label,
        [Parameter(Mandatory = $true)][string]$ReportPath,
        [Parameter(Mandatory = $true)][string]$ExpectedReportSha256,
        [Parameter(Mandatory = $true)][string]$ExpectedAabPath
    )

    $actualReportSha256 = (Get-FileHash -LiteralPath $ReportPath -Algorithm SHA256).Hash.ToUpperInvariant()
    if ($actualReportSha256 -ne $ExpectedReportSha256) {
        throw "$Label-Buildbericht abgelehnt. Erwarteter SHA-256: $ExpectedReportSha256. Tatsaechlicher SHA-256: $actualReportSha256."
    }
    $report = Get-Content -LiteralPath $ReportPath -Raw | ConvertFrom-Json
    $reportedAabPath = [System.IO.Path]::GetFullPath([string]$report.aab)
    $expectedFullAabPath = [System.IO.Path]::GetFullPath($ExpectedAabPath)
    if (($report.schemaVersion -ne 1) -or
        ($report.status -ne 'passed') -or
        ([string]$report.error -ne '') -or
        ($report.requestedCommit -ne 'fb937dd73355b9bb6f037c2b0e547da9cdb6bbaf') -or
        ($report.resolvedCommit -ne $expectedSourceCommit) -or
        ($report.sourceHeadCommit -ne $expectedSourceCommit) -or
        ($report.sourceMode -ne 'git-commit') -or
        ($report.artifactMode -ne 'unsigned-candidate') -or
        (-not [bool]$report.sourceTreeClean) -or
        ([int]$report.versionCode -ne $expectedVersionCode) -or
        ([string]$report.versionName -ne $expectedVersionName) -or
        ([int]$report.sourceFileCount -ne $expectedSourceFileCount) -or
        (@($report.preBuildDifferences).Count -ne 0) -or
        (@($report.packagedDifferences).Count -ne 0) -or
        ([bool]$report.signatureVerified) -or
        ([bool]$report.releaseReady) -or
        ($report.inputAabSha256 -ne $expectedUnsignedSha256) -or
        ($report.aabSha256 -ne $expectedUnsignedSha256) -or
        ([string]$report.signedAabSha256 -ne '') -or
        ($reportedAabPath -ne $expectedFullAabPath)) {
        throw "$Label-Buildbericht ist nicht exakt an den freigegebenen Code-33-Kandidaten gebunden."
    }
    return [pscustomobject]@{
        Report = $report
        Sha256 = $actualReportSha256
    }
}

function Invoke-Code33Preflight {
    foreach ($required in @(
        $jarsigner,
        $keytool,
        $keystore,
        $unsignedAab,
        $peerUnsignedAab,
        $buildReport,
        $peerBuildReport
    )) {
        if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
            throw "Erforderliche Datei fehlt: $required"
        }
    }

    if ((Resolve-Path -LiteralPath (Split-Path -Parent $signedAab)).Path -ne
        (Resolve-Path -LiteralPath $releaseDirectory).Path) {
        throw 'Die signierte Ausgabe liegt nicht im freigegebenen Releaseordner.'
    }
    if ([System.IO.Path]::GetFullPath($unsignedAab) -eq [System.IO.Path]::GetFullPath($signedAab)) {
        throw 'Eingabe und Ausgabe duerfen nicht identisch sein.'
    }
    foreach ($target in @($signedAab, $signatureReport)) {
        if (Test-Path -LiteralPath $target) {
            throw "Ausgabe existiert bereits und wird nicht ueberschrieben: $target"
        }
    }

    $selectedReport = Assert-Code33BuildReport `
        -Label 'A' `
        -ReportPath $buildReport `
        -ExpectedReportSha256 $expectedBuildReportSha256 `
        -ExpectedAabPath $unsignedAab
    $peerReport = Assert-Code33BuildReport `
        -Label 'B' `
        -ReportPath $peerBuildReport `
        -ExpectedReportSha256 $expectedPeerBuildReportSha256 `
        -ExpectedAabPath $peerUnsignedAab

    $selectedSha256 = Assert-WrnAabInputHash -AabPath $unsignedAab -ExpectedSha256 $expectedUnsignedSha256
    $peerSha256 = Assert-WrnAabInputHash -AabPath $peerUnsignedAab -ExpectedSha256 $expectedUnsignedSha256
    if ($selectedSha256 -ne $peerSha256) {
        throw 'Die beiden reproduzierten Code-33-Builds sind nicht byteidentisch.'
    }

    $selectedSignatureEntries = @(Get-WrnAabSignatureEntries -AabPath $unsignedAab)
    $peerSignatureEntries = @(Get-WrnAabSignatureEntries -AabPath $peerUnsignedAab)
    if (($selectedSignatureEntries.Count -ne 0) -or ($peerSignatureEntries.Count -ne 0)) {
        throw 'Mindestens einer der freigegebenen Kandidaten ist nicht mehr unsigniert.'
    }

    $selectedAssetManifest = Get-WrnAabWebAssetManifest -AabPath $unsignedAab
    $peerAssetManifest = Get-WrnAabWebAssetManifest -AabPath $peerUnsignedAab
    $selectedPayloadManifest = Get-WrnAabPayloadManifest -AabPath $unsignedAab
    $peerPayloadManifest = Get-WrnAabPayloadManifest -AabPath $peerUnsignedAab
    if (($selectedAssetManifest.Count -ne $expectedAssetCount) -or
        ($selectedPayloadManifest.Count -ne $expectedPayloadCount)) {
        throw 'Der freigegebene Kandidat besitzt nicht die abgenommene Asset-/Payload-Anzahl.'
    }
    if (@(Compare-WrnHashManifest $selectedAssetManifest $peerAssetManifest).Count -ne 0) {
        throw 'Die Webassets der beiden reproduzierten Builds unterscheiden sich.'
    }
    if (@(Compare-WrnHashManifest $selectedPayloadManifest $peerPayloadManifest).Count -ne 0) {
        throw 'Der Payload der beiden reproduzierten Builds unterscheidet sich.'
    }

    return [pscustomobject]@{
        InputSha256 = $selectedSha256
        PeerSha256 = $peerSha256
        BuildReportSha256 = $selectedReport.Sha256
        PeerBuildReportSha256 = $peerReport.Sha256
        AssetManifest = $selectedAssetManifest
        PayloadManifest = $selectedPayloadManifest
        AssetCount = $selectedAssetManifest.Count
        PayloadCount = $selectedPayloadManifest.Count
        SignatureEntryCount = $selectedSignatureEntries.Count
        PeerSignatureEntryCount = $peerSignatureEntries.Count
    }
}

function Assert-Code33KeystoreCertificate {
    $output = @(& $keytool `
        -list `
        -v `
        -keystore $keystore `
        -alias $keyAlias `
        -storepass:env WRN_KEYSTORE_PASSWORD 2>&1 | ForEach-Object { $_.ToString() })
    if ($LASTEXITCODE -ne 0) {
        throw 'Keystore, Passwort oder freigegebener Alias konnte nicht geprueft werden.'
    }
    $match = [regex]::Match(($output -join [Environment]::NewLine), '(?i)SHA-?256:\s*([0-9A-F:]{64,})')
    $actual = if ($match.Success) {
        $match.Groups[1].Value.Replace(':', '').ToUpperInvariant()
    } else {
        ''
    }
    if ($actual -ne $expectedCertificateSha256) {
        throw "Keystore-Zertifikat abgelehnt. Erwarteter SHA-256: $expectedCertificateSha256. Tatsaechlicher SHA-256: $actual."
    }
    return $actual
}

# Dieser vollstaendig lesende Gate laeuft vor jedem GUI- und Passwortkontakt.
$preflight = Invoke-Code33Preflight
$signerScriptSha256 = (Get-FileHash -LiteralPath $PSCommandPath -Algorithm SHA256).Hash
$helperScriptSha256 = (Get-FileHash -LiteralPath $helperScript -Algorithm SHA256).Hash

if ($PreflightOnly) {
    [ordered]@{
        status = 'preflight-passed'
        sourceCommit = $expectedSourceCommit
        versionName = $expectedVersionName
        versionCode = $expectedVersionCode
        inputAab = $unsignedAab
        inputSha256 = $preflight.InputSha256
        peerAab = $peerUnsignedAab
        peerSha256 = $preflight.PeerSha256
        buildReportSha256 = $preflight.BuildReportSha256
        peerBuildReportSha256 = $preflight.PeerBuildReportSha256
        inputAssetCount = $preflight.AssetCount
        inputPayloadCount = $preflight.PayloadCount
        inputSignatureEntryCount = $preflight.SignatureEntryCount
        peerSignatureEntryCount = $preflight.PeerSignatureEntryCount
        signedAab = $signedAab
        signatureReport = $signatureReport
        keyAlias = $keyAlias
        expectedCertificateSha256 = $expectedCertificateSha256
        signerScriptSha256 = $signerScriptSha256
        helperScriptSha256 = $helperScriptSha256
        outputExists = (Test-Path -LiteralPath $signedAab)
        reportExists = (Test-Path -LiteralPath $signatureReport)
        uploadPerformed = $false
    } | ConvertTo-Json -Depth 4
    return
}

if ([System.Threading.Thread]::CurrentThread.GetApartmentState() -ne [System.Threading.ApartmentState]::STA) {
    throw 'Das Passwort-GUI muss mit pwsh -STA gestartet werden.'
}

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = 'WRN 2.1.2 · Code 33 lokal signieren'
$form.Size = New-Object System.Drawing.Size(530, 310)
$form.StartPosition = 'CenterScreen'
$form.TopMost = $true
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false

$intro = New-Object System.Windows.Forms.Label
$intro.Location = New-Object System.Drawing.Point(20, 18)
$intro.Size = New-Object System.Drawing.Size(480, 66)
$intro.Text = "Zwei Builds und Eingabe geprueft: $($preflight.InputSha256.Substring(0, 16))…`r`nCommit: $($expectedSourceCommit.Substring(0, 12))… · $expectedVersionName / Code $expectedVersionCode`r`nAlias: $keyAlias · Zertifikat: $($expectedCertificateSha256.Substring(0, 16))… · Kein Upload."
$form.Controls.Add($intro)

$storeLabel = New-Object System.Windows.Forms.Label
$storeLabel.Location = New-Object System.Drawing.Point(20, 100)
$storeLabel.Size = New-Object System.Drawing.Size(180, 20)
$storeLabel.Text = 'Keystore-Passwort'
$form.Controls.Add($storeLabel)

$storeBox = New-Object System.Windows.Forms.TextBox
$storeBox.Location = New-Object System.Drawing.Point(210, 97)
$storeBox.Size = New-Object System.Drawing.Size(290, 24)
$storeBox.UseSystemPasswordChar = $true
$storeBox.ShortcutsEnabled = $true
$form.Controls.Add($storeBox)

$keyLabel = New-Object System.Windows.Forms.Label
$keyLabel.Location = New-Object System.Drawing.Point(20, 138)
$keyLabel.Size = New-Object System.Drawing.Size(180, 34)
$keyLabel.Text = "Schluesselpasswort`r`n(leer = Keystore-Passwort)"
$form.Controls.Add($keyLabel)

$keyBox = New-Object System.Windows.Forms.TextBox
$keyBox.Location = New-Object System.Drawing.Point(210, 141)
$keyBox.Size = New-Object System.Drawing.Size(290, 24)
$keyBox.UseSystemPasswordChar = $true
$keyBox.ShortcutsEnabled = $true
$form.Controls.Add($keyBox)

$status = New-Object System.Windows.Forms.Label
$status.Location = New-Object System.Drawing.Point(20, 183)
$status.Size = New-Object System.Drawing.Size(480, 34)
$form.Controls.Add($status)

$button = New-Object System.Windows.Forms.Button
$button.Location = New-Object System.Drawing.Point(280, 225)
$button.Size = New-Object System.Drawing.Size(220, 34)
$button.Text = 'Exakten Code-33-AAB signieren'
$form.Controls.Add($button)
$form.AcceptButton = $button

$button.Add_Click({
    if (-not $storeBox.Text) {
        $status.ForeColor = [System.Drawing.Color]::DarkRed
        $status.Text = 'Bitte das Keystore-Passwort eingeben.'
        return
    }
    $button.Enabled = $false
    $status.ForeColor = [System.Drawing.Color]::Black
    $status.Text = 'Reproduzierbarkeit, Hash, Alias, Signatur und Payload werden geprueft …'
    $form.Refresh()

    try {
        # Direkt vor dem Geheimniskontakt und der Transaktion alle oeffentlichen
        # Bindungen nochmals pruefen.
        $clickPreflight = Invoke-Code33Preflight
        $env:WRN_KEYSTORE_PASSWORD = $storeBox.Text
        $env:WRN_KEY_PASSWORD = $(if ($keyBox.Text) { $keyBox.Text } else { $storeBox.Text })
        $keystoreCertificateSha256 = Assert-Code33KeystoreCertificate

        $transactionState = @{ SigningResult = $null }
        $artifacts = @(
            [pscustomobject]@{ Name = 'Aab'; FinalPath = $signedAab },
            [pscustomobject]@{ Name = 'SignatureReport'; FinalPath = $signatureReport }
        )
        $prepare = {
            param($entries)
            $aabEntry = @($entries | Where-Object Name -eq 'Aab')[0]
            $reportEntry = @($entries | Where-Object Name -eq 'SignatureReport')[0]
            $transactionState.SigningResult = New-WrnVerifiedSignedAab `
                -InputAab $unsignedAab `
                -OutputAab $aabEntry.TemporaryPath `
                -JarsignerPath $jarsigner `
                -KeytoolPath $keytool `
                -Keystore $keystore `
                -KeyAlias $keyAlias `
                -ExpectedCertificateSha256 $expectedCertificateSha256 `
                -ExpectedInputSha256 $expectedUnsignedSha256 `
                -ExpectedAssetManifest $clickPreflight.AssetManifest `
                -ExpectedPayloadManifest $clickPreflight.PayloadManifest

            $result = $transactionState.SigningResult
            $verification = $result.Signature
            [ordered]@{
                schemaVersion = 2
                status = 'passed'
                createdAt = (Get-Date).ToUniversalTime().ToString('o')
                sourceCommit = $expectedSourceCommit
                versionName = $expectedVersionName
                versionCode = $expectedVersionCode
                inputAab = $unsignedAab
                inputSha256 = $result.InputSha256
                peerAab = $peerUnsignedAab
                peerSha256 = $clickPreflight.PeerSha256
                buildReport = $buildReport
                buildReportSha256 = $clickPreflight.BuildReportSha256
                peerBuildReport = $peerBuildReport
                peerBuildReportSha256 = $clickPreflight.PeerBuildReportSha256
                inputAssetCount = $clickPreflight.AssetCount
                inputPayloadCount = $clickPreflight.PayloadCount
                outputAab = $signedAab
                outputSha256 = $result.OutputSha256
                assetDifferences = @($result.AssetDifferences)
                payloadDifferences = @($result.PayloadDifferences)
                keyAlias = $keyAlias
                expectedCertificateSha256 = $expectedCertificateSha256
                keystoreCertificateSha256 = $keystoreCertificateSha256
                actualCertificateSha256 = $verification.ActualCertificateSha256
                certificateMatches = $verification.CertificateMatches
                signatureEntries = @($verification.SignatureEntries)
                jarsignerVerified = $verification.JarsignerReportedVerified
                jarsignerReportedUnsigned = $verification.JarsignerReportedUnsigned
                signerScriptSha256 = $signerScriptSha256
                helperScriptSha256 = $helperScriptSha256
                uploadPerformed = $false
            } | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $reportEntry.TemporaryPath -Encoding UTF8
        }

        $validate = {
            param($entries)
            $result = $transactionState.SigningResult
            if (-not $result) { throw 'Signaturpruefung lieferte kein Ergebnis.' }
            if ($result.InputSha256 -ne $expectedUnsignedSha256) { throw 'Signaturbericht enthaelt nicht den freigegebenen Eingabehash.' }
            if (@($result.AssetDifferences).Count -ne 0) { throw 'Webassets unterscheiden sich nach der Signierung.' }
            if (@($result.PayloadDifferences).Count -ne 0) { throw 'AAB-Payload unterscheidet sich nach der Signierung.' }
            if (-not $result.Signature.Valid) { throw 'Signatur- oder Zertifikatspruefung ist nicht gueltig.' }

            $reportEntry = @($entries | Where-Object Name -eq 'SignatureReport')[0]
            $report = Get-Content -LiteralPath $reportEntry.TemporaryPath -Raw | ConvertFrom-Json
            if (($report.schemaVersion -ne 2) -or
                ($report.status -ne 'passed') -or
                ($report.sourceCommit -ne $expectedSourceCommit) -or
                ($report.versionName -ne $expectedVersionName) -or
                ([int]$report.versionCode -ne $expectedVersionCode) -or
                ($report.inputSha256 -ne $expectedUnsignedSha256) -or
                ($report.peerSha256 -ne $expectedUnsignedSha256) -or
                ($report.buildReportSha256 -ne $expectedBuildReportSha256) -or
                ($report.peerBuildReportSha256 -ne $expectedPeerBuildReportSha256) -or
                ($report.outputSha256 -ne $result.OutputSha256) -or
                ($report.keyAlias -ne $keyAlias) -or
                ($report.keystoreCertificateSha256 -ne $expectedCertificateSha256) -or
                ($report.actualCertificateSha256 -ne $expectedCertificateSha256) -or
                (-not $report.certificateMatches) -or
                (-not $report.jarsignerVerified) -or
                $report.jarsignerReportedUnsigned -or
                (@($report.assetDifferences).Count -ne 0) -or
                (@($report.payloadDifferences).Count -ne 0) -or
                $report.uploadPerformed) {
                throw 'Temporärer Signaturbericht ist unvollstaendig oder widerspruechlich.'
            }
            return $result
        }

        $published = Invoke-WrnArtifactTransaction `
            -Artifacts $artifacts `
            -BuildRoot $releaseDirectory `
            -Prepare $prepare `
            -Validate $validate
        $result = $published.Validation
        $status.ForeColor = [System.Drawing.Color]::DarkGreen
        $status.Text = 'Signatur, Payload und Upload-Zertifikat erfolgreich geprueft.'
        [System.Windows.Forms.MessageBox]::Show(
            "Signierte AAB erstellt, nicht hochgeladen:`r`n$signedAab`r`n`r`nSHA-256:`r`n$($result.OutputSha256)",
            'WRN 2.1.2 · Code 33',
            'OK',
            'Information'
        ) | Out-Null
        $form.Close()
    } catch {
        $status.ForeColor = [System.Drawing.Color]::DarkRed
        $status.Text = $_.Exception.Message
        $button.Enabled = $true
    } finally {
        $env:WRN_KEYSTORE_PASSWORD = $null
        $env:WRN_KEY_PASSWORD = $null
        $storeBox.Clear()
        $keyBox.Clear()
    }
})

$form.Add_FormClosed({
    $env:WRN_KEYSTORE_PASSWORD = $null
    $env:WRN_KEY_PASSWORD = $null
    $storeBox.Clear()
    $keyBox.Clear()
})
$form.Add_Shown({ $storeBox.Focus() })
try {
    [void]$form.ShowDialog()
} finally {
    $env:WRN_KEYSTORE_PASSWORD = $null
    $env:WRN_KEY_PASSWORD = $null
    $storeBox.Clear()
    $keyBox.Clear()
    $form.Dispose()
}
