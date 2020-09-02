# Pre-requisites
1. Install Dynamics 365 Fraud Protection to your tenant in accordance with the [documentation](https://docs.microsoft.com/en-us/dynamics365/fraud-protection/provision-azure-tenant#provision-your-existing-azure-tenant)
2. Create a mail account for alerts. The preferable provider is the [https://outlook.live.com/](https://outlook.live.com/)

3. Install tools on deployment host:
   * Powershell version 7.0.3 (on Mac and Linux), 5.1.0 (on Windows)
   * Powershell module 'Az' version 4.4.0
   * Powershell module 'Az.ManagedServiceIdentity' version 0.7.3
   * Poswershell module 'AzureADPreview' version 2.0.2.105 (only on Windows platform)
   * Az Cli version 2.10.0
   * Oracle Java 11.0.8
   * yarn package manager version 1.22.0
   * nodeJS version 12.16.1

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
uniq by nature.

SubscriptionId and TenantId are two important parameters and should be verified they both have
correct ids.

Environment type parameter envType ('Prod' or 'Dev') should be configured correctly. Based on this
parameter the corresponding set of DFP permissions will be applied on application.

**Verify application options:**
* Check all durations, URLs, and roles in [queue service property file](https://github.com/griddynamics/msd365fp-manual-review/blob/master/backend/queues/src/main/resources/application.yml)
* Check all durations, URLs, and roles in [analytics service property file](https://github.com/griddynamics/msd365fp-manual-review/blob/master/backend/analytics/src/main/resources/application.yml)

Configuration files are available in the future in AppService.

WARNING! Redeployment will override any manual changes in configuration files.

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

# Deploy application
## Initial deployment
When deploying the application for the first time, the mail account password should be provided (see step 2 on
*Prerequisites*). Use the following command to initiate deployment with prompting for mail account password:
```
pwsh deploy.ps1 -config main.parameters.<X>.json -setMailPassword
```
Mail account password is stored in Azure Key Vault.
## Redeployments
If solution is already deployed, in order to apply changes, use the following command
```
pwsh deploy.ps1 -config main.parameters.<X>.json
```
The mail account password at this stage is already present in Key Vault and it is not required to input
it each time.

Note: it is possible to automate deployment and exclude prompting password by invoking deploy.ps1 script
from some powershell wrapper script, and provide mail account password as **secureString** type parameter
**-mailSecurePassword** .

## Post-deployment actions
Once you've installed the new environment from scratch you need to configure application for your needs.
Please, find below the tuning description.

### Notification templates
Analytics BE module uses notification templates that are stored in the related CosmosDB database called `AnalyticsDB`.
The application creates default templates automatically if there are no other templates in the DB. 
In order to change a desired template, you can find it in the `ConfigurableAppSetting` container and edit it as your wish.

You can use any placeholder that mentioned in 
[code](../backend/analytics/src/main/java/com/griddynamics/msd365fp/manualreview/analytics/config/Constants.java)
with the `MAIL_TAG_` prefix 

### External tool links
Queue BE module store templates of External Tool Links in the related Cosmos DB database `QueuesDB`.
There are no default templates in the application code, so you need to define them manually. 
For that, open the `ConfigurableAppSetting` container and put templates in the following format:
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
Installation doesn't include DFP configuration for purchase sending. In order to do it:
1. Get the connection string for dfp-hub policy `dfpSend`. 
For that open resource group for your installation and open Event Hubs Namespace resource both for primary
region and for secondary region. Then open the `dfp-hub` event hub and go to `Share access policies` blade. 
1. On the DFP configuration page `https://dfp.microsoft-int.com/<TenantId>/env/ga/configuration/eventtracing`
create two new subscriptions using obtained connection strings.
3. On the DFP rule configuration page `https://dfp.microsoft-int.com/<TenantId>/env/ga/purchase/rules` for
Purchase Protection create a new rule with `Trace()` clause which will send purchases to Manual Review.

## Notes about run deployment on Mac OS 
**Grant DFP Api permissions**
This step uses 'AzureAD' powershell module and can't be performed automatically when deployment run on 
Mac OS (or Linux) machine. It should be performed manually after deploy.ps1 finish, and can be performed 
in Azure Cloud Shell or on Windows machine with installed module.

In order to grant permissions replace in file `grant_dfp_permissions.ps1` folowing 
variables:
```
$c_app_name = "<set your prefix from configuration file>"
$c_app_role_names = @(<set roles list for environment>)
```

Then apply powershell code. The easiest way is to copy-paste code in Cloud Shell.

For Dev/Test environment roles with "Sandbox" prefix should be applied ("Sandbox_Risk_API","Sandbox_ManualReview_API"), for Production - without "Sandbox" prefix ("Risk_API","ManualReview_API").

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
