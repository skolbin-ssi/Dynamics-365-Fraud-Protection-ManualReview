# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

Param(
    [string] $AD_APP_NAME,

    [string] $CLIENT_SECRET,

    [string[]] $REPLY_URLS
)

$ErrorActionPreference = "Stop"

# Register Azure AD Application
Write-Host "= Register App"$AD_APP_NAME
$CLIENT_ID = (az ad app list --display-name "${AD_APP_NAME}" --query "[0].appId")
if (!($CLIENT_ID))
{
    $output = ( az ad app create --display-name "${AD_APP_NAME}" `
        --oauth2-allow-implicit-flow `
        --available-to-other-tenants `
        --password "${CLIENT_SECRET}" `
        --reply-urls $REPLY_URLS `
        --app-roles @manifests/ad_app_roles_manifest.json `
        --optional-claims @manifests/ad_app_claims_manifest.json `
        --required-resource-accesses @manifests/ad_app_permissions_manifest.json )
    
    if ($LastExitCode -ne 0) {
        throw "Last command failed, check logs"
    }
    
    $CLIENT_ID = (az ad app list --display-name ${AD_APP_NAME} --query "[0].appId")
    $CLIENT_ID = $CLIENT_ID.Trim('"')

    Write-Host "= Update app identifier uris"
    az ad app update --id "${CLIENT_ID}" `
        --identifier-uris "api://${CLIENT_ID}"

    if ($LastExitCode -ne 0) {
        throw "Last command failed, check logs"
    }
}
else {
    Write-Host "= Azure AD App is already exist"
    $CLIENT_ID = $CLIENT_ID.Trim('"')
}

Write-Host "= Update app properties"
az ad app update --id "${CLIENT_ID}" `
    --password "${CLIENT_SECRET}" `
    --reply-urls $REPLY_URLS `
    --required-resource-accesses @manifests/ad_app_permissions_manifest.json

if ($LastExitCode -ne 0) {
    throw "Last command failed, check logs"
}

Write-Host "= Check if SP already exist"
$APP_SP_ID = (az ad sp list --filter "displayname eq '${AD_APP_NAME}'" --query "[0].objectId" )
if (!($APP_SP_ID))
{
    Write-Host "= Create SP"
    $output = ( az ad sp create --id "${CLIENT_ID}" )

    if ($LastExitCode -ne 0) {
        throw "Last command failed, check logs"
    }

    az ad sp update --id "${CLIENT_ID}" --add tags "WindowsAzureActiveDirectoryIntegratedApp"

    if ($LastExitCode -ne 0) {
        throw "Last command failed, check logs"
    }
}
else {
    Write-Host "= SP is already exist"
}

