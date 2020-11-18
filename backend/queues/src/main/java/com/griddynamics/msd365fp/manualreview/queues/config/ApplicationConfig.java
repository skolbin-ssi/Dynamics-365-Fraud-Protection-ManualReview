// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.config;

import com.google.common.cache.CacheBuilder;
import com.griddynamics.msd365fp.manualreview.queues.config.properties.ApplicationProperties;
import com.griddynamics.msd365fp.manualreview.queues.config.properties.CacheProperties;
import com.griddynamics.msd365fp.manualreview.queues.config.properties.CachePropertyEntry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import javax.annotation.Nonnull;
import java.util.Objects;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.DEFAULT_CACHE_INVALIDATION_INTERVAL;
import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.DEFAULT_CACHE_SIZE;

@Slf4j
@RequiredArgsConstructor
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties({ApplicationProperties.class, CacheProperties.class})
@EnableCaching
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

    /**
     * Cache manager configuration bean.
     * This implementation allows to configure
     * time-to-live for entries per each cache
     *
     * @param cacheProperties - a config bean
     * @return the new CacheManager bean is based on guava cache
     */
    @Bean
    public CacheManager cacheManager(final CacheProperties cacheProperties) {
        return new ConcurrentMapCacheManager() {
            @Override
            @Nonnull
            protected Cache createConcurrentMapCache(@Nonnull final String name) {
                CachePropertyEntry config = Objects.requireNonNull(cacheProperties.get(name));
                CacheBuilder<Object, Object> cacheBuilder = CacheBuilder.newBuilder()
                        .expireAfterWrite(Objects.requireNonNullElse(
                                config.getInvalidationInterval(), DEFAULT_CACHE_INVALIDATION_INTERVAL))
                        .maximumSize(Objects.requireNonNullElse(
                                config.getMaxSize(), DEFAULT_CACHE_SIZE));
                return new ConcurrentMapCache(name,
                        cacheBuilder.build().asMap(), false);
            }
        };
    }
}
