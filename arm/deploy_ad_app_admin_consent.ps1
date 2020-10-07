Param(
    [string] $AD_APP_NAME
)

$ErrorActionPreference = "Stop"

Write-Host "= Get application client id"$AD_APP_NAME
$CLIENT_ID = (az ad app list --display-name "${AD_APP_NAME}" --query "[0].appId")
$CLIENT_ID = $CLIENT_ID.Trim('"')

# if admin-consent is already set, skip
$grants = (az ad app permission list-grants --id $CLIENT_ID) | Out-String | ConvertFrom-Json
if ($grants.Length -eq 0) {
    Write-Host "= Set admin consent"
    az ad app permission admin-consent --id "${CLIENT_ID}"
    if ($LastExitCode -ne 0) {
        throw "Last command failed, check logs"
    }
}
else {
    Write-Host "= Admin consent is already set"
}
