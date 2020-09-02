param(
    [Parameter(Mandatory=$true)]
    [string] $srcSA,

    [Parameter(Mandatory=$true)]
    [string] $srcCont,

    [Parameter(Mandatory=$true)]
    [string] $srcRG,

    [Parameter(Mandatory=$true)]
    [string] $dstSA,

    [Parameter(Mandatory=$true)]
    [string] $dstRG,

    [Parameter(Mandatory=$true)]
    [string] $logLevel,

    [Parameter(Mandatory=$true)]
    [string] $clientId,

    [Parameter(Mandatory=$true)]
    [string] $tenantId,

    [Parameter(Mandatory=$true)]
    [string] $mapClientId
)

Function SetContentType
{
    param(
        [Microsoft.WindowsAzure.Commands.Common.Storage.ResourceModel.AzureStorageBlob] $Blob, 
        [string] $ContentType
    )

    $CloudBlockBlob = [Microsoft.Azure.Storage.Blob.CloudBlockBlob] $Blob.ICloudBlob

    $CloudBlockBlob.Properties.ContentType = $ContentType
    $task = $CloudBlockBlob.SetPropertiesAsync()
    $task.Wait()
    
    Write-Host $task.Status
}

$dstCont = '$web'

# Initialize context
$srcKeys = Get-AzStorageAccountKey -Name $srcSA -ResourceGroupName $srcRG
$srcCtx = New-AzStorageContext -StorageAccountName $srcSA -StorageAccountKey $srcKeys.Item(0).value

$dstKeys = Get-AzStorageAccountKey -Name $dstSA -ResourceGroupName $dstRG
$dstCtx = New-AzStorageContext -StorageAccountName $dstSA -StorageAccountKey $dstKeys.Item(0).value

# Configure frontend storage account as static content
Enable-AzStorageStaticWebsite -Context $dstCtx -IndexDocument "index.html"

# Update configuration file in deployment storage account
Get-AzStorageBlobContent `
    -Container $srcCont `
    -Context $srcCtx `
    -Blob "config.json" `
    -Force

$json = Get-Content "config.json" | ConvertFrom-Json

$json.logLevel = $logLevel
$json.clientId = $clientId
$json.tenant = $tenantId
$json.mapClientId = $mapClientId

$json | ConvertTo-Json | Set-Content 'config.json'

Set-AzStorageBlobContent `
    -Container $srcCont `
    -Context $srcCtx `
    -File "config.json" `
    -Blob "config.json" `
    -Properties @{"ContentType" = "application/json";} `
    -Force

# Patch content type for files in frontend static container
# Current implementation of Set-AzStorageBlobContent sets default content
# type stream-octet
$blobs = Get-AzStorageBlob -Container $srcCont -Context $srcCtx

foreach ($blob in $blobs) {
    $Ext = [IO.Path]::GetExtension($Blob.Name)
    $ContentType = ""

    switch ($Ext) {
        ".jpg" { $ContentType = "image/jpeg" }
        ".jpeg" { $ContentType = "image/jpeg" }
        ".png" { $ContentType = "image/png" }

        ".ico" { $ContentType = "image/x-icon" }
        ".html" { $ContentType = "text/html" }
        ".json" { $ContentType = "application/json" }
        ".js" { $ContentType = "application/javascript" }
        ".txt" { $ContentType = "text/plain" }
        ".css" { $ContentType = "text/css" }
        ".woff" { $ContentType = "font/woff" }
        ".woff2" { $ContentType = "font/woff2" }

        Default { $ContentType = "" }
    }
    SetContentType $Blob $ContentType
}

# Clean frontend from previous deployment
Get-AzStorageBlob -Container $dstCont -Context $dstCtx | Remove-AzStorageBlob

# Deploy new version
Get-AzStorageBlob -Container $srcCont -Context $srcCtx `
    | Start-AzStorageBlobCopy -DestContainer $dstCont -DestContext $dstCtx
