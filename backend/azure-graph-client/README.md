# High-level client for Azure Graph API invocation
The library works as a starter.

## Requirements

### Bean
The configured `OAuth2AuthorizedClientManager` bean should exist in 
the application context with a OAuth2AuthorizedClientProvider 
that configured for the client_credentials flow.

### Properties
The following properties should be defined:
```
azure:
  graph-api:
    role-assignments:
      url: https://graph.microsoft.com/v1.0/servicePrincipals/${APP_SP_ID}/appRoleAssignedTo
    users:
      url: https://graph.microsoft.com/v1.0/users
    app-service-principal:
      url: https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId eq '${CLIENT_ID}'
    user-photo:
      url-template: https://graph.microsoft.com/beta/users/#user_id#/photo/$value
spring:
  security:
    oauth2:
      client:
        registration:
          azure-graph-api:
            client-id: ${CLIENT_ID}
            client-secret: ${CLIENT_SECRET}
            authorization-grant-type: client_credentials
            scope: https://graph.microsoft.com/.default
        provider:
          azure-graph-api:
            token-uri: https://login.microsoftonline.com/${CLIENT_TENANT_ID}/oauth2/v2.0/token

``` 

