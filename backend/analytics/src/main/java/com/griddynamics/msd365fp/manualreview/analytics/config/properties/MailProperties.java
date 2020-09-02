package com.griddynamics.msd365fp.manualreview.analytics.config.properties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConstructorBinding
@ConfigurationProperties("spring.mail")
@Getter
@AllArgsConstructor
public class MailProperties {

    private final String host;
    private final int port;
    private final String username;
    private final String password;
    private final String transportProtocol;
    private final Boolean smtpAuth;
    private final Boolean smtpStartTls;


}
