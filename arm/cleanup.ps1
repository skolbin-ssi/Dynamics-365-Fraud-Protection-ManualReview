# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

Param(
  [Parameter(Mandatory=$true)]
  [string] $config,

  [string] $location = "westus"
)

$ErrorActionPreference = "Stop"

# Read prefix from json
$json = Get-Content $config | ConvertFrom-Json
$prefix = $json.parameters.prefix.value
$subscriptionId = $json.parameters.subscriptionId.value
$tenantId = $json.parameters.tenantId.value

$deploymentResourceGroup  = $prefix + "-rg"
$logWorkspace             = $prefix + "-log-analytics-ws"
$logWorkspaceSecondary    = $prefix + "-secondary-log-analytics-ws"
$mapAppName               = $prefix + "-map"


# Login to Azure and set context
Write-Host "=== Setting Azure context..."
if (!(Set-AzContext -SubscriptionId $subscriptionId -TenantId $tenantId -ErrorAction Ignore)) {
  Write-Host "= Login to Azure"
  Write-Host "Provide credentials for PS in tenant ${tenantId} and subscription ${subscriptionId}"
  Login-AzAccount
  Set-AzContext -SubscriptionId $subscriptionId -TenantId $tenantId
}

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


# Remove analytics workspace without recovery option
# Powershell snippet works only in last PS module Az version 4.5.0
# Remove-AzOperationalInsightsWorkspace `
#   -ResourceGroupName $deploymentResourceGroup `
#   -Name $logWorkspace `
#   -ForceDelete
foreach ($la in @($logWorkspace, $logWorkspaceSecondary)) {
  Write-Host "Removing log analytics workspace"$la
  az monitor log-analytics workspace delete `
    --resource-group $deploymentResourceGroup `
    --workspace-name $la `
    --force true -y
}

foreach ($app in @($prefix, $mapAppName)) {
    # remove AD service principal
    if (Get-AzADServicePrincipal -DisplayName $app -ErrorAction Ignore) {
      Write-Host "Removing Azure AD service principal $app"
      Remove-AzADServicePrincipal `
        -DisplayName $app `
        -Force
    }

    # remove AD application
    if (Get-AzADApplication -DisplayName $app -ErrorAction Ignore) {
      Write-Host "Removing Azure AD application $app"
      Remove-AzADApplication `
        -DisplayName $app `
        -Force
    }
}

# remove deployment resource group
if (Get-AzResourceGroup -Name $deploymentResourceGroup -ErrorAction Ignore) {
  Write-Host "Removing resource group"$deploymentResourceGroup
  # Sometimes command failed with error, add one retry
  if(!(Remove-AzResourceGroup -Name $deploymentResourceGroup -Force -ErrorAction Ignore)) {
    Remove-AzResourceGroup -Name $deploymentResourceGroup -Force
  }
}

[System.Console]::Beep()
