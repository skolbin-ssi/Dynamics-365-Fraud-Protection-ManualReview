package com.griddynamics.msd365fp.manualreview.queues.config;

import com.griddynamics.msd365fp.manualreview.queues.config.properties.ApplicationProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Slf4j
@RequiredArgsConstructor
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties({ApplicationProperties.class})
public class ApplicationConfig {

    private final ApplicationProperties applicationProperties;

    @Bean
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor threadPoolTaskExecutor = new ThreadPoolTaskExecutor();
        ApplicationProperties.TaskExecutor taskExecutor = applicationProperties.getTaskExecutor();
        threadPoolTaskExecutor.setCorePoolSize(taskExecutor.getCorePoolSize());
        threadPoolTaskExecutor.setMaxPoolSize(taskExecutor.getMaxPoolSize());
        threadPoolTaskExecutor.setQueueCapacity(taskExecutor.getQueueCapacity());
        log.info("Task executor was set with parameters: maxPoolSize=[{}], corePoolSize=[{}]",
                threadPoolTaskExecutor.getMaxPoolSize(), threadPoolTaskExecutor.getCorePoolSize());
        return threadPoolTaskExecutor;
    }
}
