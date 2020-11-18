#!/usr/bin/env sh
# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

if [ -z "$(az account show --query=tenantId)" ]; then
  echo "ERROR. Login to AZ CLI"
  exit 1
fi

echo "-----[ read configuration ]-----"
SOLUTION_NAME=${1:?should be defined}

echo solution: ${SOLUTION_NAME}

echo "-----[ calculate variables ]-----"
export SPRING_PROFILES_ACTIVE="local"
AD_APP_NAME=${SOLUTION_NAME}
GROUP_NAME=${SOLUTION_NAME}-rg
ANALYTICS_APP_SERVICE_NAME=${SOLUTION_NAME}-analytics

CLIENT_TENANT_ID=$(az account show --query=tenantId)
CLIENT_TENANT_ID="${CLIENT_TENANT_ID%\"}"
export CLIENT_TENANT_ID="${CLIENT_TENANT_ID#\"}"

CLIENT_TENANT_SHORT_NAME=$(az account show --query=name)
CLIENT_TENANT_SHORT_NAME="${CLIENT_TENANT_SHORT_NAME%.onmicrosoft.com\"}"
export CLIENT_TENANT_SHORT_NAME="${CLIENT_TENANT_SHORT_NAME#\"}"

COSMOSDB_ACCOUNT_NAME=${SOLUTION_NAME}-storage
COSMOSDB_ENDPOINT=$(az cosmosdb show \
  -n ${COSMOSDB_ACCOUNT_NAME} \
  -g ${GROUP_NAME} \
  --query "documentEndpoint")
COSMOSDB_ENDPOINT="${COSMOSDB_ENDPOINT%\"}"
export COSMOSDB_ENDPOINT="${COSMOSDB_ENDPOINT#\"}"

COSMOSDB_KEY=$(az cosmosdb keys list \
-n ${COSMOSDB_ACCOUNT_NAME} \
-g ${GROUP_NAME} \
--query="primaryMasterKey")
COSMOSDB_KEY="${COSMOSDB_KEY%\"}"
export COSMOSDB_KEY="${COSMOSDB_KEY#\"}"

EVENT_HUB_NAMESPACE_NAME=${SOLUTION_NAME}-ehub
EVENT_HUB_CONNECTION_STRING=$(az eventhubs namespace authorization-rule keys list \
 -n RootManageSharedAccessKey \
 --namespace-name ${EVENT_HUB_NAMESPACE_NAME} \
 -g ${GROUP_NAME} \
 --query "primaryConnectionString")
EVENT_HUB_CONNECTION_STRING="${EVENT_HUB_CONNECTION_STRING%\"}"
export EVENT_HUB_CONNECTION_STRING="${EVENT_HUB_CONNECTION_STRING#\"}"

EVENT_HUB_OFFSET_STORAGE_NAME=$(echo ${SOLUTION_NAME} | sed -e 's/-//g')
export EVENT_HUB_OFFSET_STORAGE_NAME=${EVENT_HUB_OFFSET_STORAGE_NAME}offsets
EVENT_HUB_OFFSET_STORAGE_KEY=$(az storage account keys list \
-n ${EVENT_HUB_OFFSET_STORAGE_NAME} \
-g ${GROUP_NAME} \
--query "[0].value")
EVENT_HUB_OFFSET_STORAGE_KEY="${EVENT_HUB_OFFSET_STORAGE_KEY%\"}"
export EVENT_HUB_OFFSET_STORAGE_KEY="${EVENT_HUB_OFFSET_STORAGE_KEY#\"}"

KEYVAULT_NAME=$(echo ${SOLUTION_NAME} | sed -e 's/-//g')
KEYVAULT_NAME=${KEYVAULT_NAME}keyvault
KEYVAULT_ENDPOINT=$(az keyvault show \
--name $KEYVAULT_NAME \
--query "properties.vaultUri")
KEYVAULT_ENDPOINT="${KEYVAULT_ENDPOINT%\"}"
export KEYVAULT_ENDPOINT="${KEYVAULT_ENDPOINT#\"}"


CLIENT_SECRET=$(az keyvault secret show \
  --n client-secret \
  --vault-name $KEYVAULT_NAME \
  --query "value")
CLIENT_SECRET="${CLIENT_SECRET%\"}"
export CLIENT_SECRET="${CLIENT_SECRET#\"}"

MAIL_PASSWORD=$(az keyvault secret show \
  --n spring-mail-password \
  --vault-name $KEYVAULT_NAME \
  --query "value")
MAIL_PASSWORD="${MAIL_PASSWORD%\"}"
export MAIL_PASSWORD="${MAIL_PASSWORD#\"}"

MAIL_SMTP_HOST=$(az webapp config appsettings list \
  -n ${ANALYTICS_APP_SERVICE_NAME} \
  -g ${GROUP_NAME} \
  --query "[?name=='MAIL_SMTP_HOST'].value | [0]")
MAIL_SMTP_HOST="${MAIL_SMTP_HOST%\"}"
export MAIL_SMTP_HOST="${MAIL_SMTP_HOST#\"}"

MAIL_SMTP_PORT=$(az webapp config appsettings list \
  -n ${ANALYTICS_APP_SERVICE_NAME} \
  -g ${GROUP_NAME} \
  --query "[?name=='MAIL_SMTP_PORT'].value | [0]")
MAIL_SMTP_PORT="${MAIL_SMTP_PORT%\"}"
export MAIL_SMTP_PORT="${MAIL_SMTP_PORT#\"}"

MAIL_USERNAME=$(az webapp config appsettings list \
  -n ${ANALYTICS_APP_SERVICE_NAME} \
  -g ${GROUP_NAME} \
  --query "[?name=='MAIL_USERNAME'].value | [0]")
MAIL_USERNAME="${MAIL_USERNAME%\"}"
export MAIL_USERNAME="${MAIL_USERNAME#\"}"

CLIENT_ID=$(az ad app list \
    --display-name ${AD_APP_NAME}\
    --query "[0].appId")
CLIENT_ID="${CLIENT_ID%\"}"
export CLIENT_ID="${CLIENT_ID#\"}"

APP_SP_ID=$(az ad sp show --id ${CLIENT_ID} --query objectId)
APP_SP_ID="${APP_SP_ID%\"}"
export APP_SP_ID="${APP_SP_ID#\"}"

DFP_SP_ID=$(az ad sp list \
    --display-name "Dynamics 365 Fraud Protection"\
    --query "[0].objectId")
DFP_SP_ID="${DFP_SP_ID%\"}"
export DFP_SP_ID="${DFP_SP_ID#\"}"

APPLICATIONINSIGHTS_APP_NAME=${SOLUTION_NAME}-app-insights
APPINSIGHTS_INSTRUMENTATIONKEY=$(az resource show \
-g ${GROUP_NAME} \
-n ${APPLICATIONINSIGHTS_APP_NAME} \
--resource-type "Microsoft.Insights/components" \
--query properties.InstrumentationKey)
APPINSIGHTS_INSTRUMENTATIONKEY="${APPINSIGHTS_INSTRUMENTATIONKEY%\"}"
export APPINSIGHTS_INSTRUMENTATIONKEY="${APPINSIGHTS_INSTRUMENTATIONKEY#\"}"
export APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=${APPINSIGHTS_INSTRUMENTATIONKEY}"

echo "Success!"

echo "-----[ Result ]-----"
echo COSMOSDB_ENDPOINT=${COSMOSDB_ENDPOINT}
echo COSMOSDB_KEY=${COSMOSDB_KEY}
echo CLIENT_ID=${CLIENT_ID}
echo CLIENT_SECRET=${CLIENT_SECRET}
echo MAP_CLIENT_ID=${CLIENT_ID}
echo MAP_CLIENT_SECRET=${CLIENT_SECRET}
echo TENANT_ID=${CLIENT_TENANT_ID}
echo CLIENT_TENANT_ID=${CLIENT_TENANT_ID}
echo APP_SP_ID=${APP_SP_ID}
echo DFP_SP_ID=${DFP_SP_ID}
echo EVENT_HUB_CONNECTION_STRING=${EVENT_HUB_CONNECTION_STRING}
echo EVENT_HUB_OFFSET_STORAGE_NAME=${EVENT_HUB_OFFSET_STORAGE_NAME}
echo EVENT_HUB_OFFSET_STORAGE_KEY=${EVENT_HUB_OFFSET_STORAGE_KEY}
echo APPLICATIONINSIGHTS_CONNECTION_STRING=${APPLICATIONINSIGHTS_CONNECTION_STRING}
echo MAIL_SMTP_HOST=${MAIL_SMTP_HOST}
echo MAIL_SMTP_PORT=${MAIL_SMTP_PORT}
echo MAIL_USERNAME=${MAIL_USERNAME}
echo MAIL_PASSWORD=${MAIL_PASSWORD}
echo KEYVAULT_ENDPOINT=${KEYVAULT_ENDPOINT}
echo CLIENT_TENANT_SHORT_NAME=${CLIENT_TENANT_SHORT_NAME}
echo SPRING_PROFILES_ACTIVE=local