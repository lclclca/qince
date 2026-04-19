package com.example.orderms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * 跨域（CORS）配置：允许前端（localhost:3000）访问后端（localhost:8080）
 * 前后端分离项目必须配置，否则浏览器会拦截请求
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("*");        // 允许所有来源（生产环境应限制具体域名）
        config.addAllowedHeader("*");               // 允许所有请求头（包括 Authorization）
        config.addAllowedMethod("*");               // 允许所有 HTTP 方法（GET/POST/PUT/DELETE）
        config.setAllowCredentials(true);           // 允许携带 Cookie/认证信息

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
