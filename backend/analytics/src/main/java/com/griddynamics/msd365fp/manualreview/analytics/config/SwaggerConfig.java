// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.Scopes;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.SECURITY_SCHEMA_CLIENTCRED;
import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.SECURITY_SCHEMA_IMPLICIT;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI(@Value("${swagger.auth-url}") final String authUrl,
                                 @Value("${swagger.token-url}") final String tokenUrl,
                                 @Value("${swagger.token-scope}") final String tokenScope) {
        OAuthFlow oAuthFlow = new OAuthFlow()
                .authorizationUrl(authUrl)
                .scopes(new Scopes());
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.OAUTH2)
                .flows(new OAuthFlows().implicit(oAuthFlow));

        OAuthFlow appOAuthFlow = new OAuthFlow()
                .tokenUrl(tokenUrl)
                .scopes(new Scopes().addString(tokenScope, "default scope to use all app-intended APIs"));
        SecurityScheme appSecurityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.OAUTH2)
                .flows(new OAuthFlows().clientCredentials(appOAuthFlow));

        Components components = new Components()
                .addSecuritySchemes(SECURITY_SCHEMA_IMPLICIT, securityScheme)
                .addSecuritySchemes(SECURITY_SCHEMA_CLIENTCRED, appSecurityScheme);
        Info info = new Info()
                .title("Analytics Service API")
                .description("Contains operations for working with Resolutions and Dashboards")
                .version("SNAPSHOT");
        return new OpenAPI()
                .addServersItem(new Server().url("/").description("default relative url"))
                .components(components)
                .info(info);
    }
}
