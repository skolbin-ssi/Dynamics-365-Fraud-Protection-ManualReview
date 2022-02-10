# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

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
  $password = -join ('abcdefghkmnrstuvwxyzABCDEFGHKLMNPRSTUVWXYZ0123456789'.ToCharArray() | Get-Random -Count 30)
  $password += -join ('!~.'.ToCharArray() | Get-Random -Count 2)
  return $password
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

    for ($i = 0; $i -lt 5; $i++) {
        Start-Sleep -s 5
        $c_sp = Get-AzureADServicePrincipal -Filter "displayName eq '$clientAppName'"
        if ($c_sp) { break }
    }

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


function ExtractSecret {
    param (
        [SecureString] $secret
    )

    $secretValueText = '';
	$ssPtr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
	try {
    $secretValueText = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ssPtr)
	} finally {
		[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ssPtr)
    }
    return $secretValueText;
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

function CreateMapApp {
    param (
        [string] $mapAppName,
        [secureString] $MapAppSecurePassword
    )

    Write-Host "= Create application"
	Write-Host $mapAppName
	
	Write-Host $mapAppSecurePassword
	
	Write-Host $mapApp.AppId
	$mapAppName
    if (!($mapApp = Get-AzADApplication -DisplayName $mapAppName)) {
        $mapApp = New-AzADApplication `
            -DisplayName $mapAppName `
            -Password $mapAppSecurePassword `
            -IdentifierUris "http://${mapAppName}"

        Write-Host "= Update application identifier uri"
        Update-AzADApplication `
            -ApplicationId $mapApp.AppId `
            -IdentifierUri "api://$($mapApp.AppId)"
    } else {
        Write-Host "Application is already exist"
    }

    Write-Host "= Create service principal"
    if (!($mapSp = Get-AzADServicePrincipal -DisplayName $mapAppName)) {
        $mapSp = New-AzADServicePrincipal `
            -DisplayName $mapAppName `
            -ApplicationId $mapApp.AppId `
            -SkipAssignment
    } else {
        Write-Host "Service principal is already exist"
    }

    return @{ 
        "mapAppId" = $mapApp.AppId 
        "mapSpId" = $mapSp.Id 
    }
}
