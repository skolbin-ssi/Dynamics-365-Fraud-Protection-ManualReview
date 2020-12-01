# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

Param(
    [Parameter(Mandatory=$true)]
    [string] $prefix,

    [Parameter(Mandatory=$true)]
    [string] $envType,

    [Parameter(Mandatory=$true)]
    [string] $tenantId,

    [SecureString] $clientSecureSecret
)

. ./functions.ps1

function ConvertSecureToPlaintext
{
    param (
        [secureString] $secureStr
    )
    # Use different functions in powershell 5.1 and 7.x+
    if (((Get-Host).Version.Major -eq "5") -And ((Get-Host).Version.Minor -eq "1")) {
        $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureStr)
        $plaintextStr = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    } else {
        $plaintextStr = ConvertFrom-SecureString -SecureString $secureStr -AsPlainText
    }
    return $plaintextStr
}


function deployAdApp {
    Param(
        [string] $AD_APP_NAME,

        [string] $CLIENT_SECRET,

        [string[]] $REPLY_URLS
    )

    $ErrorActionPreference = "Stop"

    # Register Azure AD application
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

        # Set admin consent
        Write-Host "= Set admin consent"
        for ($i = 0; $i -lt 5; $i++) {
            Write-Host "Retry"$i
            Start-Sleep -s 10
            az ad app permission admin-consent --id "${CLIENT_ID}"
            if ($LastExitCode -eq 0) { break }
        }

        if ($LastExitCode -ne 0) {
            throw "Last command failed, check logs"
        }
    }
    else {
        Write-Host "= SP is already exist"
    }
}

#################################################################   MAIN PROGRAM

Write-Host "== Verify Azure context..."
$currentAzureContext = Get-AzContext
if (!($currentAzureContext.Tenant.Id -eq $tenantId)) {
    Write-Host "= Login to Azure"
    Write-Host "Provide credentials for PS in tenant ${tenantId}"
    Login-AzAccount
}

$az_tenant = (az account show --query "tenantId").Trim('"')
if (!($az_tenant -eq $tenantId)) {
    Write-Host "= Provide credentials for Az Cli in tenant ${tenantId} and subscription ${subscriptionId}"
    az login
}

# Init AzureAD in windows environment
if (CheckOSWindows)
{
    # Will skip re-prompting credentials for AzureAD module
    Connect-AzureAD -TenantId $currentAzureContext.Tenant.Id -AccountId $currentAzureContext.Account.Id
}

# Read Azure app client secret
if (!($clientSecureSecret)) {
    $clientSecureSecret = Read-Host "Enter the Azure application secret" -AsSecureString
}

# Register application in Azure AD
Write-Host "== Create Azure App registration"
$replyUrls = GenReplyUrls
$clientSecret = ConvertSecureToPlaintext -SecureStr $clientSecureSecret
deployAdApp -AD_APP_NAME "$prefix" -CLIENT_SECRET "$clientSecret" -REPLY_URLS $replyUrls

# read application id and service principal id
$appAd = Get-AzADApplication -DisplayName $prefix
$appServicePrincipal = Get-AzADServicePrincipal -ApplicationId $appAd.ApplicationId

# read DFP application service principal
try {
    $dfpAppServicePrincipal = Get-AzADServicePrincipal -DisplayName "Dynamics 365 Fraud Protection"
}
catch {
    "Please check if you installed Dynamics 365 Fraud Protection to your tenant (see Readme.md)"
}

# Assign Azure App permissions for DFP
# Works only on Windows due to AzureAD module
# on Mac grant_dfp_permissions.ps1 shuld be execured (see Readme for more details)
if (CheckOSWindows)
{
    Write-Host "== Assing DFP roles to application"
    foreach ($dfpRoleName in $dfpRoles[$envType]) {
        GrantDfpPermissionWin -clientAppName $prefix -dfpRoleName $dfpRoleName
    }
}

# Read tenant short name
$tenantShortName = GetTenantShortName -TenantId $tenantId

# Outputs
Write-Host "== Collect shared parameters"
Write-Host "Azure AD application name:"$prefix
Write-Host "Azure AD application client id:"$appAd.ApplicationId
Write-Host "Azure AD app service principal:"$appServicePrincipal.Id
Write-Host "Dynamics 365 Fraud Protection service principal id:"$dfpAppServicePrincipal.Id
Write-Host "Tenant id:"$tenantId
Write-Host "Tenant short name:"$tenantShortName

return @{ 
    "appClientId"           = $appAd.ApplicationId
    "appSpId"         = $appServicePrincipal.Id
    "dfpSpId"         = $dfpAppServicePrincipal.Id
    "clientTenantShortName" = $tenantShortName
}
