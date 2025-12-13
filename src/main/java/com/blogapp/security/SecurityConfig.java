package com.blogapp.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/oauth2/**").permitAll()  // OAuth2 endpoints - public
                // Public GET endpoints for posts
                .requestMatchers(HttpMethod.GET, "/api/posts").permitAll()  // GET all posts - public
                .requestMatchers(HttpMethod.GET, "/api/posts/search").permitAll()  // Search posts - public
                .requestMatchers(HttpMethod.GET, "/api/posts/{id}").permitAll()  // GET post by ID - public
                .requestMatchers(HttpMethod.GET, "/api/posts/category/**").permitAll()  // GET posts by category - public
                .requestMatchers(HttpMethod.GET, "/api/posts/user/**").permitAll()  // GET posts by user - public
                .requestMatchers(HttpMethod.GET, "/api/posts/stats/**").permitAll()  // GET stats - public
                .requestMatchers(HttpMethod.POST, "/api/posts/{id}/view").permitAll()  // Increment view - public
                // Authenticated POST, PUT, DELETE endpoints
                .requestMatchers(HttpMethod.POST, "/api/posts").hasAnyRole("EDITOR", "ADMIN")  // POST create - EDITOR and ADMIN
                .requestMatchers(HttpMethod.PUT, "/api/posts/**").authenticated()  // PUT update - authenticated (ownership checked in service)
                .requestMatchers(HttpMethod.DELETE, "/api/posts/**").hasRole("ADMIN")  // DELETE - ADMIN only
                .requestMatchers("/api/categories").permitAll()  // GET all categories - public
                .requestMatchers("/api/categories/{id}").permitAll()  // GET category by ID - public
                .requestMatchers("/api/categories/**").hasRole("ADMIN")  // POST, PUT, DELETE - admin only
                .requestMatchers("/api/users/me").authenticated()  // Current user - authenticated
                .requestMatchers("/api/users/profile").authenticated()  // User profile - authenticated
                .requestMatchers("/api/users/check-email").permitAll()  // Email check - public
                .requestMatchers("/api/users/{id}").permitAll()  // GET user by ID - public
                .requestMatchers("/api/users").hasRole("ADMIN")  // GET all users - admin only
                .requestMatchers("/api/users/**").hasRole("ADMIN")  // POST, PUT, DELETE - admin only
                .requestMatchers("/api/upload/**").authenticated()  // File upload - All authenticated users
                // Comments - GET is public, POST/PUT/DELETE require authentication
                .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()  // GET comments - public
                .requestMatchers(HttpMethod.POST, "/api/comments").authenticated()  // POST create comment - authenticated
                .requestMatchers(HttpMethod.PUT, "/api/comments/**").authenticated()  // PUT update comment - authenticated
                .requestMatchers(HttpMethod.DELETE, "/api/comments/**").authenticated()  // DELETE comment - authenticated
                .requestMatchers("/api/likes/**").authenticated()  // Likes - authenticated
                .requestMatchers("/api/settings").permitAll()  // GET settings - public
                .requestMatchers("/api/settings/**").hasRole("ADMIN")  // PUT settings - admin only
                .requestMatchers("/api/ads/active").permitAll()  // GET active ads - public
                .requestMatchers("/api/ads/position/**").permitAll()  // GET ads by position - public
                .requestMatchers("/api/ads/**").hasRole("ADMIN")  // POST, PUT, DELETE ads - admin only
                .requestMatchers("/api/contact/submit").permitAll()  // POST contact - public
                .requestMatchers("/api/contact/**").hasRole("ADMIN")  // GET, PUT, DELETE submissions - admin only
                .requestMatchers("/api/statistics/**").hasAnyRole("ADMIN", "EDITOR", "USER")  // Statistics - ADMIN, EDITOR, and USER
                .requestMatchers("/api/follows/**").authenticated()  // Follow endpoints - authenticated
                .requestMatchers("/api/search").permitAll()  // Unified search - public
                .requestMatchers("/sitemap.xml").permitAll()  // Sitemap - public
                .requestMatchers("/sitemap.txt").permitAll()  // Sitemap text - public
                .requestMatchers("/uploads/**").permitAll()
                .anyRequest().authenticated()
            );
        
        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

