# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

Param(
  [Parameter(Mandatory=$true)]
  [string] $config,

  [switch] $recovery,

  [string] $location = "westus"
)

$ErrorActionPreference = "Stop"

# Read prefix from json
$json = Get-Content $config | ConvertFrom-Json
$prefix = $json.parameters.prefix.value
$subscriptionId = $json.parameters.subscriptionId.value
$tenantId = $json.parameters.tenantId.value

$deploymentResourceGroup  = $prefix + "-rg"
$cosmosAccountName        = $prefix + "-storage"
$sa_ragrs                 = @(($prefix.ToLower().Replace("-","") + "deploysa"), ($prefix.ToLower().Replace("-","") + "static"))
$optimalRegions          = @('West US', 'East US')
$failoverRegions         = @('East US', 'West US')

function WriteState {
    Write-Host ""
    Write-Host "=== Web applications state"
    Get-AzWebApp -ResourceGroupName $deploymentResourceGroup | Format-Table -Property Name,Location,State

    Write-Host "=== CosmosDB state"
    $cosmosdb = Get-AzCosmosDBAccount -ResourceGroupName $deploymentResourceGroup
    Write-Host "Cosmosdb write location : "$cosmosdb.WriteLocations.LocationName
    Write-Host "Cosmosdb locations      : "($cosmosdb.Locations.LocationName -Join ', ')

    Write-Host "=== Storage accounts state"
    Get-AzStorageAccount -ResourceGroupName $deploymentResourceGroup | Format-Table -Property StorageAccountName,SkuName,PrimaryLocation,SecondaryLocation
}

function FailOver {
    Write-Host "=== Stopping web application"
    Get-AzWebApp -ResourceGroupName $deploymentResourceGroup `
        | Where-Object { $_.Location -eq 'West US'} `
        | Stop-AzWebApp -ResourceGroupName $deploymentResourceGroup `
        | select Name,State

    Write-Host "=== Failover Cosmos DB"
    Update-AzCosmosDBAccountFailoverPriority `
        -ResourceGroupName $deploymentResourceGroup `
        -Name $cosmosAccountName `
        -FailoverPolicy $failoverRegions

    # Due to major bug in Azure failover for Storage Account doesn't work at the moment
    # Write-Host "=== Failover Storage Accounts"
    # foreach ($sa in $sa_ragrs) {
    #     Write-Host $sa
    #     Invoke-AzStorageAccountFailover `
    #         -ResourceGroupName $deploymentResourceGroup `
    #         -Name $sa `
    #         -Force
    # }
}

function RecOver {
    Write-Host "=== Starting web application"
    Get-AzWebApp -ResourceGroupName $deploymentResourceGroup `
        | Where-Object { $_.Location -eq 'West US'} `
        | Start-AzWebApp -ResourceGroupName $deploymentResourceGroup `
        | select Name,State

    Write-Host "=== Recover Cosmos DB"
    Update-AzCosmosDBAccountFailoverPriority `
        -ResourceGroupName $deploymentResourceGroup `
        -Name $cosmosAccountName `
        -FailoverPolicy $optimalRegions

    # Write-Host "=== Failover Storage Accounts"
    # foreach ($sa in $sa_ragrs) {
    #     Write-Host $sa
    #     Invoke-AzStorageAccountFailover `
    #         -ResourceGroupName $deploymentResourceGroup `
    #         -Name $sa `
    #         -Force
    # }
}

function LoginToAzure {
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
}

############################################      MAIN PROGRAM
LoginToAzure

WriteState

if ($recovery) {
    RecOver
} else {
    FailOver
}

WriteState
