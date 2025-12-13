package com.blogapp.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                "categories",      // Cache for categories
                "subcategories",  // Cache for subcategories
                "users",          // Cache for users
                "posts",          // Cache for posts
                "userProfiles"    // Cache for user profiles
        );
        
        cacheManager.setCaffeine(caffeineCacheBuilder());
        return cacheManager;
    }
    
    private Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
                .initialCapacity(100)                    // Initial cache size
                .maximumSize(500)                         // Maximum cache entries
                .expireAfterWrite(30, TimeUnit.MINUTES)  // Expire after 30 minutes
                .expireAfterAccess(10, TimeUnit.MINUTES)  // Expire if not accessed for 10 minutes
                .recordStats();                           // Enable cache statistics
    }
}







