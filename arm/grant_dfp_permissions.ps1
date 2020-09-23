# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

# This script intended to patch Azure AD App service principal permissions
# when deploying from non-Windows environment, as it requires AzureAD
# powershell module, which is not ported to non-Windows platform at time of
# writing.
# It can be executed in Cloud Shell or on Windows machine with AzureAD module
# installed

# Replace client application name with correct one
$c_app_name = "dfp-manrev-stage"

# Pick a role to assign; use Risk_API for production or Sandbox_Risk_API for sandbox (test) access.
$c_app_role_names = @("Sandbox_Risk_API", "Sandbox_ManualReview_API")

Connect-AzureAD

################################################################
# -- There is no need to change the script below this line. –- 
################################################################
$app_name = "Dynamics 365 Fraud Protection"
$sp = Get-AzureADServicePrincipal -Filter "displayName eq '$app_name'"

$c_sp = Get-AzureADServicePrincipal -Filter "displayName eq '$c_app_name'"

# Assign roles
foreach ($c_app_role_name in $c_app_role_names) {
    Write-Host "Assigning role"$c_app_role_name
    $c_appRole = $sp.AppRoles | Where-Object { $_.DisplayName -eq $c_app_role_name }
    New-AzureADServiceAppRoleAssignment -ObjectId $c_sp.ObjectId -PrincipalId $c_sp.ObjectId -ResourceId $sp.ObjectId -Id $c_appRole.Id 
}
