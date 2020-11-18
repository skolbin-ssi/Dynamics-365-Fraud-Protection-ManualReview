# Pre-requisites
1. Install Dynamics 365 Fraud Protection to your tenant in accordance with the [documentation](https://docs.microsoft.com/en-us/dynamics365/fraud-protection/provision-azure-tenant#provision-your-existing-azure-tenant)
2. Create a mail account for alerts. The preferable provider is the [https://outlook.live.com/](https://outlook.live.com/)
3. Create active subscription in Azure for solution resources. Remember Azure subscription id and tenant id for deployment steps.
4. You must have assigned to you the 'Global Administrator' role in Azure Active Directory and the 'Owner' in Subscriptions.

5. Install tools on deployment host:
   * Powershell version 7.0.3 [Instruction for Mac and Linux](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-core-on-macos?view=powershell-7), 5.1.0 (on Windows, should be pre-installed)
   * Powershell module 'Az' version 4.5.0 [Install instructions](https://docs.microsoft.com/en-us/powershell/azure/install-az-ps?view=azps-4.5.0)
   * Powershell module 'Az.ManagedServiceIdentity'
     ```Install-Module -Name Az.ManagedServiceIdentity -Scope AllUsers```
   * Poswershell module 'AzureADPreview' version 2.0-preview (only on Windows platform) [Install instructions](https://docs.microsoft.com/en-us/powershell/azure/active-directory/install-adv2?view=azureadps-2.0-preview)
   * Az Cli version 2.10.0 [Install instructions](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
   * Oracle Java 11.0.8 [Download page](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
   * yarn package manager version 1.22.0 [Download page](https://classic.yarnpkg.com/en/docs/install/)
   * nodeJS version 12.16.1 [Download page](https://nodejs.org/dist/v12.16.1/)


## Windows 2016 install tips
AzureAD module doesn't work correctly in Powershell 7.0, when trying to use both modules it generates exceptions
at login/connect. Posible reason explained in [link](https://github.com/Azure/azure-powershell/issues/11446).
On Windows platform Powershell version 5.1.x should be used.
The documentation about installing 'Az' powershell module available at [link](https://docs.microsoft.com/en-us/powershell/azure/install-az-ps?view=azps-4.4.0)
Following steps should be performed on Windows 2016 Server in order to prepare enviroment for deployment.
```
# Execute in Powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Install-Module -Name PowerShellGet -Force
Install-Module -Name Az -AllowClobber -Scope AllUsers
Install-Module -Name Az.ManagedServiceIdentity -Scope AllUsers
Install-Module -name AzureAdPreview -Scope AllUsers
```

# Prepare environment configuration file
Environment configuration settings stored in single file main.parameters.X.json.

Based on example file 'main.parameters.tst.json', create new file.

Change 'prefix' parameter, should be uniq for environment. It defines the general prefix of all
resources, created during deployment. Some of them, like storage account name, should be
uniq by nature. The 'prefix' parameter MUST be shorter than 14 characters.

SubscriptionId and TenantId are two important parameters and should be verified they both have
correct ids.


## Environment type parameter
Environment type parameter envType (allowed values `Prod`,`Dev`) should be configured properly.
This parameter modifies following configuration settings
1. DFP roles, assigned to Azure AD application
   For Dev environment roles with prefix 'Sandbox' will be applied
2. List of reply-urls in Azure AD application
   For Dev environment 'localhost' urls will be added to provide a way to debug locally
3. The appropriate spring profile will be configured for backend Java Web App

## Technical alert configuration

Technical alerts are not related to business metric alerts inside application. Technical
alerts are intended for troubleshooting and support. 

**Warning!** Technical alerts can contain information from logs.

### Alerts notificatioin email
In order to configure health/availability alerts for the solution, add the following parameter with
list of email addresses to properties file:
```
"alertReceivers": {
   "value": [
      "<email@address1>",
      "<email@address2>"
   ]
}
```
Alerts will be sent to this list of recepients.

When this parameter is absent in the configuration file, technical alerts will be disabled.

### Technical alerts parameters
It is possible to tune alerts parameters, such as threshold, frequence, windowSize.
The configuration should always be done by adding or changing corresponding values in properties
file.

The full list of available configuration parameters and allowed values can be found in
*parameters* section of *main.json* template file.

As an example, the following parameters could be provided to change defaults for 
*NoIncomingEventsDfphub* alert:
```
"NoIncomingEventsDfphubEvaluationFrequency": {
   "value": "PT1H"
},
"NoIncomingEventsDfphubThreshold": {
   "value": 0
},
"NoIncomingEventsDfphubWindowSize": {
   "value": "P1D"
}
```

## Custom domain configuration
In order to provide custom domain as entry point to the solution, following steps should be 
accomplished:
1. Add "customDomain" parameter to environment configuration file with domain name as value
2. Configure CNAME record `<custom domain name> IN CNAME <$prefix.azurefd.net.>` in custom
   domain dns zone
3. If you have a Certificate Authority Authorization (CAA) record with your DNS provider, 
   it must include DigiCert as a valid CA. 

For mode details see [Front Doors documentation](https://docs.microsoft.com/en-us/azure/frontdoor/front-door-custom-domain-https#validate-the-domain)
Digicert [explanation](https://docs.digicert.com/manage-certificates/dns-caa-resource-record-check/)

Previous steps should be performed before run deployment, as Azure Front Doors will validate custom domain
dns zone before applying configuration.

# Verify application options
Depending on what you defined in deployment properties as the envType, the different property files will be used:
* For `Dev` check all durations, URLs, and roles in:
    * [queue service property file](../backend/queues/src/main/resources/application-int.yml)
    * [queue service property file for secondary region](../backend/queues/src/main/resources/application-int-secondary.yml)
    * [analytics service property file](../backend/analytics/src/main/resources/application-int.yml)
    * [analytics service property file for secondary region](../backend/analytics/src/main/resources/application-int-secondary.yml)
* For `Dev` check all durations, URLs, and roles in:
    * [queue service property file](../backend/queues/src/main/resources/application-prod.yml)
    * [queue service property file for secondary region](../backend/queues/src/main/resources/application-prod-secondary.yml)
    * [analytics service property file](../backend/analytics/src/main/resources/application-prod.yml)
    * [analytics service property file for secondary region](../backend/analytics/src/main/resources/application-prod-secondary.yml)
* For both environment types all other parameters are specified in common files (common files have lower priority and 
any value in env-specific property files will override values defined here):
    * [common queue service property file](../backend/queues/src/main/resources/application.yml)
    * [commion analytics service property file](../backend/analytics/src/main/resources/application.yml)

Configuration files are available in the future in AppService.
**WARNING!** Redeployment will override any manual changes in configuration files made at AppService.

# Deploy application
## Single tenant deployment
Single tenant deployment creates all objects (Azure AD applications, azure resources) in single tenant.
It also use same tenant Active Directory to authenticate users, accessing the application.

### Initial deployment (single tenant)
When deploying the application for the first time, the mail account password should be provided (see step 2 on
*Prerequisites*). Use the following command to initiate deployment with prompting for mail account password:
```
pwsh deploy.ps1 -config main.parameters.<X>.json -setMailPassword
```
Mail account password is stored in Azure Key Vault.
### Redeployments (single tenants)
If solution is already deployed, in order to apply changes, use the following command
```
pwsh deploy.ps1 -config main.parameters.<X>.json
```
The mail account password at this stage is already present in Key Vault and it is not required to input
it each time.

Note: it is possible to automate deployment and exclude prompting password by invoking deploy.ps1 script
from some powershell wrapper script, and provide mail account password as **secureString** type parameter
**-mailSecurePassword** .

## Two tenants deployment
Two tenants deployment separates deployment of objects into two tenants: client and provider.
Client tenant in this case used to create Azure AD application with necessary permissions, to install
DFP application, and to authenticate users, accessing the application.
Provider tenant is used to deploy all Azure resources required to implement the application.
 
Two tenants deployment splitted into two phases. Phase one should be performed in client tenant, and phase
two in provider tenant
 
### Initial deployment (two tenants)
 
#### Phase one (client side)
During this phase Azure AD application and service principal will be created in the client tenant.
Use the following command:
```pwsh ./deploy_ad_app.ps1 -prefix <prefix> -envType <Dev|Prod> -tenantId <tenant_id>```
At this phase one will be prompted for the azure active directory application secret. This secret should
be shared with the provider in a secure manner. Also the output block starting from `Collect shared parameters`
should be shared with the provider.
 
#### Phase two (provider side)
Before starting deployment on provider side, shared parameters from client (see previous step) should be
added to environment configuration file main.parameters.<X>.json
```json
"clientTenantId": {
  "value": ""
},
"clientTenantShortName": {
  "value": ""
},
"appClientId": {
  "value": ""
},
"appSpId": {
  "value": ""
},
"dfpSpId": {
  "value": ""
}
```
When the environment configuration file is ready, run the following command to start the deployment:
```
pwsh ./deploy.ps1 -config main.parameters.<X>.json -setMailPassword -SetClientSecret -twoTenants
```
One will be prompted to enter the mail account password and azure application secret, which was shared
with the client on phase one.
 
### Redeployments (two tenants)
 
#### Redeployment (two tenants, client side)
Normally there is no reason to re-run deployment on the client side. It can happen when there is a requirement
to update client application secret, application reply urls, or client application permissions.
The redeployment can be run with the command
```pwsh ./deploy_phase1.ps1 -prefix <prefix> -envType <Dev|Prod> -tenantId <tenant_id>```
Be aware, that when client application is updated, it is not applied to service principal automatically. It
might require to re-create service principal for the application.
 
#### Redeployment (two tenants, provider side)
If solution is already deployed, in order to apply changes, use the following command
```
pwsh deploy.ps1 -config main.parameters.<X>.json -twoTenants
```

## Post-deployment actions
Once you've installed the new environment from scratch you need to configure application for your needs.
Please, find below the tuning description.

### Notification templates
Analytics BE module uses notification templates that are stored in the related CosmosDB database called `AnalyticsDB`.
The application creates default templates automatically if there are no other templates in the DB. 
In order to change a desired template, you can find it in the `ConfigurableAppSettings` container and edit it as your wish.

You can use any placeholder that mentioned in 
[code](../backend/analytics/src/main/java/com/griddynamics/msd365fp/manualreview/analytics/config/Constants.java)
with the `MAIL_TAG_` prefix 

### External tool links
Queue BE module store templates of External Tool Links in the related Cosmos DB database `QueuesDB`.
There are no default templates in the application code, so you need to define them manually. 
For that, open the `ConfigurableAppSettings` container and put templates in the following format:
```json
{
    "type": "review-console-links",
    "active": true,
    "values": {
        "fieldPath": "purchase.User.UserId",
        "name": "Inspector",
        "template": "https://somwtool.www.tool.com/cstool/members/#",
        "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/somecompany.svg.png"
    }
}
```
please, note that:
* fields `type`, `active`, `values.fieldPath`, and `values.template` are mandatory;
* field `type` should always be `review-console-links` for external tool links;
* field `template` should have a single `#` placeholder;
* field `fieldPath` should be a correct path in accordance with the internal models and 
shouldn't point to fields in arrays or composite non-textual fields;

### DFP integration
Installation doesn't include DFP configuration for purchase events sending event trace data to Event hub. In order to do it:
1. Get the connection string for dfp-hub policy `dfpSend`. 
For that open resource group for your installation and open Event Hubs Namespace resource both for primary
region and for secondary region. Then open the `dfp-hub` event hub and go to `Share access policies` blade. 
1. On the DFP configuration page `https://dfp.microsoft-int.com/<TenantId>/env/ga/configuration/eventtracing`
create two new subscriptions using obtained connection strings.
3. On the DFP rule configuration page `https://dfp.microsoft-int.com/<TenantId>/env/ga/purchase/rules` for
Purchase Protection create a new rule with `Trace()` clause which will send purchases to Manual Review.

### Grant DFP API permissions
This step should be omitted when installation is done from Windows machine.
The deployment script uses 'AzureAD' powershell module and can't be performed automatically when deployment run on 
Mac OS (or Linux) machine. It should be performed manually after deploy.ps1 finish, and can be performed 
in Azure Cloud Shell or on Windows machine with installed module.

1. In order to grant permissions replace in file `grant_dfp_permissions.ps1` folowing 
variables:
    ```
    $c_app_name = "<set your prefix from configuration file>"
    $c_app_role_names = @(<set roles list for environment>)
    ```
2. Then apply powershell code. The easiest way is to copy-paste code in Cloud Shell.
3. Once you executed the script, restart all App Services in `<$prefix>-rg` resource group.

For Dev/Test environment roles with "Sandbox" prefix should be applied ("Sandbox_Risk_API","Sandbox_ManualReview_API"), for Production - without "Sandbox" prefix ("Risk_API","ManualReview_API").

### New users with deployment permissions
Following permissions should be configured for the new user, who should perform deployments when initial
deployment is already done:
1. Add `Owner` permission on Azure Maps Account, created for deployment
2. Add policy for new user on Azure Key Vault, created for deployment, with management permissions on secrets

# Notes about deployment configurations
## UDF functions for Cosmos DB
UDF function for Cosmos DB in current deployment approach defined in Cosmos DB ARM template file directly.
Cosmos DB template located in `/arm/templates/CosmosDB.json` file.

In order to configure new function and assign it to Cosmos DB item, in CosmosDb template change appropriate
variable in section **variables** and assign udf function to appropriate resource type
"Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/userDefinedFunctions", section with that
resource types located in the end of template.

# Cleanup environment
There is specific cleanup script provided and should be used to remove deployment from subscription.
Script includes removing log analytics workspace without recovery option, removing of AD groups and
applications and removing resource group.

In order to run cleanup execute command
```
pwsh cleanup.ps1 -config <main.parameters.<X>.json>
```

# Microsoft Open Source code of conduct

For additional information, see the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct).
