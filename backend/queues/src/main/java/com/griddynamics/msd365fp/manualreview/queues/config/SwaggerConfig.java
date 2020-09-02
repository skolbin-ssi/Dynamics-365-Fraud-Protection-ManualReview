package com.griddynamics.msd365fp.manualreview.queues.config;

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

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.SECURITY_SCHEMA_IMPLICIT;

/**
 * Authorization configuration.
 * in accordance with:
 *
 * @see "https://github.com/OAI/OpenAPI-Specification/blob/3.0.1/versions/3.0.1.md#securitySchemeObject"
 * @see "https://github.com/OAI/OpenAPI-Specification/blob/3.0.1/versions/3.0.1.md#oauthFlowObject"
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI(@Value("${swagger.auth-url}") final String authUrl) {
        OAuthFlow oAuthFlow = new OAuthFlow()
                .authorizationUrl(authUrl)
                .scopes(new Scopes());
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.OAUTH2)
                .flows(new OAuthFlows().implicit(oAuthFlow));
        Components components = new Components()
                .addSecuritySchemes(SECURITY_SCHEMA_IMPLICIT, securityScheme);
        Info info = new Info()
                .title("Queues Service API")
                .description("Contains operations for working with Items, Queues and Users")
                .version("SNAPSHOT");
        return new OpenAPI()
                .addServersItem(new Server().url("/").description("default relative url"))
                .components(components)
                .info(info);
    }
}
