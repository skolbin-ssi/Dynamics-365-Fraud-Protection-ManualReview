# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

# Requirements
# Install-Module -Name Az.ManagedServiceIdentity -AllowPrerelease

Param(
  [Parameter(Mandatory=$true)]
  [string] $config,

  [SecureString] $mailSecurePassword,

  [switch] $setMailPassword,

  [string] $location = "westus"
)

$ErrorActionPreference = "Stop"

$frontendContainer     = "web"

# Dict with java microservice name and path to base directory
$applications = @{
  "queues"    =  "../backend/queues"
  "analytics" = "../backend/analytics"
}
$version = Get-Date -Format FileDateTimeUniversal
# Path to fronend build directory
$frontendBuildPath = "../frontend/scripts"

# DFP roles definition
$dfpRoles = @{}
$dfpRoles["Dev"] = @(
        "Sandbox_Risk_API",
        "Sandbox_ManualReview_API"
        )
$dfpRoles["Prod"] = @(
        "Risk_API",
        "ManualReview_API"
        )

# Read prefix from json
$json = Get-Content $config | ConvertFrom-Json

$prefix         = $json.parameters.prefix.value
$subscriptionId = $json.parameters.subscriptionId.value
$tenantId       = $json.parameters.tenantId.value
$envType        = $json.parameters.envType.value
$customDomain   = $json.parameters.customDomain.value

$deploymentResourceGroup  = $prefix + "-rg"
$deploymentStorageAccount = $prefix.ToLower().Replace("-","") + "deploysa"
$deploymentContainer      = "deploy"
$sasTokenHours            = 24 * 365      # one year
$deploymentIdentity       = $prefix + "-deploy-identity"
$keyVaultName             = $prefix.ToLower().Replace("-","") + "keyvault"

$mapsGroupName             = $prefix + "-map-access"

$baseDir = Get-Location

function BuildFrontend {
    Set-Location "${baseDir}/$frontendBuildPath"
    Copy-Item -Path "config.template.json" -Destination "../public/config.json"
    yarn install
    yarn build
    if ($LastExitCode -ne 0) {
        throw "Build failed, check logs"
    } 
    New-Item -Path "${baseDir}/build" -Name "frontend" -ItemType "directory" -ErrorAction Ignore
    Copy-Item -Path "../build/*" -Destination "${baseDir}/build/frontend" -Recurse
    Set-Location $baseDir
}

function BuildBackend {
    foreach ($app in $applications.GetEnumerator()) {
        Write-Host "=== Building $($app.Name) app..."
        Set-Location "${baseDir}/$($app.Value)"
        if (CheckOSWindows) {
            ./gradlew.bat clean packageDist --console=plain
        } else {
            ./gradlew clean packageDist --console=plain
        }
        if ($LastExitCode -ne 0) {
            throw "Build failed, check logs"
        }
        New-Item -Path "${baseDir}/build" -Name "$($app.Name)" -ItemType "directory" -ErrorAction Ignore
        Copy-Item -Path "build/dist/target.zip" -Destination "${baseDir}/build/$($app.Name)/target.zip" -Recurse
    }  
}

function GetRandomPassword {
  -join ('abcdefghkmnrstuvwxyzABCDEFGHKLMNPRSTUVWXYZ0123456789'.ToCharArray() | Get-Random -Count 32)
}

function ProvideCleanContainer {
  param (
    $storageContainer,
    $storageContext
  )

  $sc = Get-AzStorageContainer -Name $storageContainer -Context $storageContext -ErrorAction Ignore
  if (!$sc) {
      Write-Host "= Create container $storageContainer"
      New-AzStorageContainer `
          -Name $storageContainer `
          -Context $storageContext
  }
  else 
  {
      Write-Host "= Clean container $storageContainer"
      Get-AzStorageBlob -Container $storageContainer -Context $storageContext `
        | Where-Object { $_.Name -notMatch '^.*target.*zip' } `
        | Remove-AzStorageBlob
  }
}

function GrantDfpPermissionWin {
    param (
        [string] $clientAppName,
        [string] $dfpRoleName
    )

    Write-Host "= Assign role $dfpRoleName to app" $clientAppName
    
    $app_name = "Dynamics 365 Fraud Protection"
    $sp = Get-AzureADServicePrincipal -Filter "displayName eq '$app_name'"
    
    $c_appRole = $sp.AppRoles | Where-Object { $_.DisplayName -eq $dfpRoleName }
    $c_sp = Get-AzureADServicePrincipal -Filter "displayName eq '$clientAppName'"

    $roleAssigned = Get-AzureADServiceAppRoleAssignedTo -ObjectId $c_sp.ObjectId `
        | Where-Object { $_.Id -eq $c_appRole.Id }

    if(!($roleAssigned))
    {
        Write-host "Assigning DFP role ..."
        New-AzureADServiceAppRoleAssignment `
            -ObjectId $c_sp.ObjectId `
            -PrincipalId $c_sp.ObjectId `
            -ResourceId $sp.ObjectId `
            -Id $c_appRole.Id
    }
    else
    {
        Write-host "DFP role is already assigned"
    }
}

function CheckOSWindows
{
    $envOS = Get-ChildItem -Path Env:OS -ErrorAction Ignore
    return ( $envOS -And $envOS.value.Contains('Windows') )
}

function PutSecret {
    param (
        [string] $vaultName,
        [string] $secretName,
        [string] $secretValue,
        [SecureString] $secretSecureValue
    )

    Write-Host "= Put secret $secretName to Key Vault $vaultName"
    if ($secretValue) {
        $secretSecureValue = ConvertTo-SecureString $secretValue -AsPlainText -Force
    }
    Set-AzKeyVaultSecret `
        -VaultName $vaultName `
        -Name $secretName `
        -SecretValue $secretSecureValue
}

function GenReplyUrls {
    # Define Azure app reply urls
    $replyUrls = @(
        "https://$prefix.azurefd.net/login",
        "https://$prefix-queues.azurewebsites.net/oauth2-redirect.html",
        "https://$prefix-queues-secondary.azurewebsites.net/oauth2-redirect.html",
        "https://$prefix-analytics.azurewebsites.net/oauth2-redirect.html",
        "https://$prefix-analytics-secondary.azurewebsites.net/oauth2-redirect.html"
    )

    $localSwaggerUri     = "http://localhost:8080/oauth2-redirect.html"
    $localFrontUri       = "http://localhost:3000/login"

    if ($envType -eq "Dev") {
        $replyUrls += @($localSwaggerUri, $localFrontUri)
    }
    if ($customDomain -And ($customDomain -ne "UNDEFINED")) {
        $replyUrls += "https://${customDomain}/login"
    }

    return $replyUrls
}

function GetTenantShortName {
    param(
        [string] $TenantId
    )

    foreach ($domain in (Get-AzTenant -TenantId $tenantId).domains) {
        if ($domain -match '(.*)\.onmicrosoft\.com') {
            return $Matches.1
        }
    }
}

#################################################################   MAIN PROGRAM

# Read mail account password from user
if ($setMailPassword) {
    $mailSecurePassword = Read-Host "Enter the mail account password" -AsSecureString
}


Write-Host "=== Setting Azure context..."
if (!(Set-AzContext -SubscriptionId $subscriptionId -TenantId $tenantId -ErrorAction Ignore)) {
  Write-Host "= Login to Azure"
  Write-Host "Provide credentials for PS in tenant ${tenantId} and subscription ${subscriptionId}"
  Login-AzAccount
  Set-AzContext -SubscriptionId $subscriptionId -TenantId $tenantId
}
$currentAzureContext = Get-AzContext

$output = az account show --subscription $subscriptionId --query 'id'
if (!($output)) {
  Write-Host "= Provide credentials for Az Cli in tenant ${tenantId} and subscription ${subscriptionId}"
  az login
  $output = az account show --subscription $subscriptionId --query 'id'
  if (!($output)) {
    throw "Please provide credentials valid tenant"
  }
}
az account set --subscription $subscriptionId

# Init AzureAD in windows environment
if (CheckOSWindows)
{
    # Will skip re-prompting credentials for AzureAD module
    Connect-AzureAD -TenantId $currentAzureContext.Tenant.Id -AccountId $currentAzureContext.Account.Id
}

# Register providers
Write-Host "=== Register Azure resource providers"
Register-AzResourceProvider `
    -ProviderNamespace Microsoft.ContainerInstance

Write-Host "=== Cleanup artifacts temporary directory"
if (Test-Path "${baseDir}/build" -PathType container) {
    Remove-Item "${baseDir}/build" -Recurse
}
New-Item -Path "${baseDir}" -Name "build" -ItemType "directory" -ErrorAction Ignore

# Build backend applications
Write-Host "=== Build backend applications"
BuildBackend

# Build frontend application
Write-Host "=== Build frontend application"
BuildFrontend


# Create Resource Group for deployment artifacts
Write-Host "=== Create resource group for deployment"
New-AzResourceGroup `
    -Name $deploymentResourceGroup `
    -Location $location `
    -Force


# Provide key vault and generate client secret for Azure AD App
Write-Host "=== Provide Key Vault"
$vault = Get-AzKeyVault -VaultName $keyVaultName
if (!($vault)) {
    $vault = New-AzKeyVault `
        -Name $keyVaultName `
        -ResourceGroupName $deploymentResourceGroup `
        -Location $location `
        -EnabledForTemplateDeployment `
        -DisableSoftDelete
}

# Store app client secret in Key Vault if it was provided
Write-Host "=== Provide Azure AD App client secret"
if (!(Get-AzKeyVaultSecret -Name "client-secret" -VaultName $keyVaultName))
{
    $clientSecret = GetRandomPassword
    PutSecret -vaultName $keyVaultName -secretName "client-secret" -secretValue $clientSecret
}
else
{
    $clientSecret = (Get-AzKeyVaultSecret -VaultName $keyVaultName -Name "client-secret").SecretValueText
}

# Store mail password in Key Vault if it was provided
if ($mailSecurePassword)
{
    PutSecret -vaultName $keyVaultName -secretName "spring-mail-password" -secretSecureValue $mailSecurePassword
}

# Register application in Azure AD
Write-Host "=== Create Azure App registration"
$replyUrls = GenReplyUrls
./deploy_ad_app.ps1 -AD_APP_NAME "$prefix" -CLIENT_SECRET "$clientSecret" -REPLY_URLS $replyUrls

# read application id and service principal id
$appAd = Get-AzADApplication -DisplayName $prefix
$appServicePrincipal = Get-AzADServicePrincipal -ApplicationId $appAd.ApplicationId

Write-Host "Azure AD application id:"$appAd.ApplicationId
Write-Host "Azure AD app service principal:"$appServicePrincipal.Id

# read DFP application service principal
try {
    $dfpAppServicePrincipal = Get-AzADServicePrincipal -DisplayName "Dynamics 365 Fraud Protection"
}
catch {
    "Please check if you installed Dynamics 365 Fraud Protection to your tenant (see Readme.md)"
}
Write-Host "Dynamics 365 Fraud Protection service principal id:"$dfpAppServicePrincipal.Id

# Assign Azure App permissions for DFP
# Works only on Windows due to AzureAD module
# on Mac grant_dfp_permissions.ps1 shuld be execured (see Readme for more details)
if (CheckOSWindows)
{
    Write-Host "=== Assing DFP roles to application"
    foreach ($dfpRoleName in $dfpRoles[$envType]) {
        GrantDfpPermissionWin -clientAppName $prefix -dfpRoleName $dfpRoleName
    }
}


Write-Host "=== Create Azure Maps Group"
if (!($mapsGroup = Get-AzADGroup -DisplayName $mapsGroupName)) 
{
    $mapsGroup = New-AzADGroup `
        -DisplayName $mapsGroupName `
        -MailNickname $mapsGroupName
}


# Prepare Storage Account
Write-Host "=== Provide storage account for deployment artifacts"
$storageAccount = Get-AzStorageAccount -name $deploymentStorageAccount -resourcegroupname $deploymentResourceGroup -ErrorAction Ignore
if (!$storageAccount) {
    $storageAccount = New-AzStorageAccount `
        -Name $deploymentStorageAccount `
        -ResourceGroupName $deploymentResourceGroup `
        -Location $location `
        -SkuName Standard_RAGRS `
        -Kind StorageV2 `
        -AllowBlobPublicAccess $false
    $ctx = $storageAccount.Context
} 
else {
    $keys = Get-AzStorageAccountKey -Name $deploymentStorageAccount -ResourceGroupName $deploymentResourceGroup
    $ctx = New-AzStorageContext -StorageAccountName $deploymentStorageAccount -StorageAccountKey $keys.Item(0).value
}


# Preparing storage container for frontend code
Write-Host "=== Create container for frontend code"
ProvideCleanContainer -storageContainer $frontendContainer -storageContext $ctx
Write-Host "=== Upload frontend static code"
Get-ChildItem -Path "build/frontend/*" -File -Recurse | Set-AzStorageBlobContent -Container $frontendContainer -Context $ctx -Force | Format-List -Property Name


# Preparing storage container for templates
Write-Host "=== Create container for templates"
ProvideCleanContainer -storageContainer $deploymentContainer -storageContext $ctx
Write-Host "=== Upload application artifacts"
foreach ($app in $applications.GetEnumerator()) {
    # Keep last two versions, remove the rest
    Get-AzStorageBlob -Container $deploymentContainer -Context $ctx `
        | Where-object { $_.Name -Match "^$($app.Name).*target.*zip" } `
        | Sort-Object LastModified -desc `
        | Select-Object -Skip 2 `
        | Remove-AzStorageBlob
    # Upload new version
    Set-AzStorageBlobContent `
        -Container $deploymentContainer `
        -Context $ctx `
        -File "build/$($app.Name)/target.zip" `
        -Blob "$($app.Name)/target-${version}.zip" `
        -Force
}
Write-Host "=== Upload templates"
Get-ChildItem -Include '*.json' -Exclude '*parameters*','*manifest*','config.json' -File -Recurse | Set-AzStorageBlobContent -Container $deploymentContainer -Context $ctx -Force | Format-List -Property Name
Get-ChildItem -Path "deploy_frontend.ps1" -File -Recurse | Set-AzStorageBlobContent -Container $deploymentContainer -Context $ctx -Force | Format-List -Property Name


# Sas token for Resource manager to get access to templates, manifests and powershell snippets
Write-Host "=== Generate SAS token for Resource Manager"
$token = New-AzStorageContainerSASToken `
    -Name $deploymentContainer `
    -Context $ctx `
    -Permission r `
    -ExpiryTime (Get-Date).AddHours($sasTokenHours)


# Managed identity used to perform powershell deployments in ARM templates            
Write-Host "=== Create managed identity for deployment"
$spId = Get-AzUserAssignedIdentity `
    -Name $deploymentIdentity `
    -ResourceGroupName $deploymentResourceGroup `
    -ErrorAction Ignore
if (!($spId))
{
  $spId = New-AzUserAssignedIdentity `
      -ResourceGroupName $deploymentResourceGroup `
      -Name $deploymentIdentity
}

Write-Host "=== Assign role to managed identity"
if (!(Get-AzRoleAssignment -ObjectId $spId.PrincipalId -ResourceGroupName $deploymentResourceGroup -ErrorAction Ignore))
{ 
    for ($i=0; $i -lt 10; $i++) {
        Start-Sleep -Seconds 5
        if (New-AzRoleAssignment -ObjectId $spId.PrincipalId -RoleDefinitionName "Contributor" -ResourceGroupName $deploymentResourceGroup -ErrorAction Ignore) {
            Write-Host "Managed Identity"$spId.Name"granted Contributor role at resource group"$deploymentResourceGroup
            break
        }
    }
}


# Read tenant short name
$tenantShortName = GetTenantShortName -TenantId $tenantId


Write-Host "=== Start deployment"
$deployment = New-AzResourceGroupDeployment `
    -ResourceGroupName $deploymentResourceGroup `
    -TemplateUri ("https://${deploymentStorageAccount}.blob.core.windows.net/deploy/main.json" + $token) `
    -TemplateParameterFile $config `
    -appClientId $appAd.ApplicationId `
    -appSpId $appServicePrincipal.Id `
    -dfpSpId $dfpAppServicePrincipal.Id `
    -mapsGroupId $mapsGroup.Id `
    -deploymentIdentity $spId.Id `
    -deploymentStorageAccount $deploymentStorageAccount `
    -tenantShortName $tenantShortName `
    -appQueuesPackageUrl ("https://${deploymentStorageAccount}.blob.core.windows.net/deploy/queues/target-${version}.zip" + $token) `
    -appAnalyticsPackageUrl ("https://${deploymentStorageAccount}.blob.core.windows.net/deploy/analytics/target-${version}.zip" + $token) `
    -keyVaultName $keyVaultName

Write-Host "=== Set admin consent for Azure AD applicaton"
./deploy_ad_app_admin_consent.ps1 -AD_APP_NAME "$prefix"

Write-Host "Deployment Output"
Write-Host $deployment.OutputsString

[System.Console]::Beep()
