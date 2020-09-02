package com.griddynamics.msd365fp.manualreview.analytics.config;

import com.griddynamics.msd365fp.manualreview.analytics.config.properties.ApplicationProperties;
import com.griddynamics.msd365fp.manualreview.analytics.config.properties.MailProperties;
import com.griddynamics.msd365fp.manualreview.analytics.streaming.OverallSizeEventStream;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.stream.config.BindingServiceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.messaging.MessageChannel;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@RequiredArgsConstructor
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties({ApplicationProperties.class, MailProperties.class})
public class ApplicationConfig {

    private final ApplicationProperties applicationProperties;

    @Bean
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor threadPoolTaskExecutor = new ThreadPoolTaskExecutor();
        ApplicationProperties.TaskExecutor taskExecutor = applicationProperties.getTaskExecutor();
        threadPoolTaskExecutor.setCorePoolSize(taskExecutor.getCorePoolSize());
        threadPoolTaskExecutor.setMaxPoolSize(taskExecutor.getMaxPoolSize());
        threadPoolTaskExecutor.setQueueCapacity(taskExecutor.getQueueCapacity());
        return threadPoolTaskExecutor;
    }
}
