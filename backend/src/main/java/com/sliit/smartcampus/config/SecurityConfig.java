package com.sliit.smartcampus.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtFilter;
    private final OAuth2SuccessHandler successHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/**", "/oauth2/**", "/login/**").permitAll()
                    .requestMatchers("/api/notifications/**").permitAll() // 👈 TEST FIX
                    .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> oauth.successHandler(successHandler))
            .addFilterBefore(jwtFilter,
                    org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*", "Authorization"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}