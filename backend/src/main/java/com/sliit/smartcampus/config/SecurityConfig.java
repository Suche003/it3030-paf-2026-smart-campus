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
            // 🔥 CSRF OFF (REST API)
            .csrf(csrf -> csrf.disable())

            // 🔥 CORS ENABLE
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 🔐 AUTH RULES (NO CHANGE)
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/**", "/oauth2/**").permitAll()
                    .anyRequest().authenticated()
            )

            // 🔐 GOOGLE LOGIN
            .oauth2Login(oauth -> oauth.successHandler(successHandler))

            // 🔐 JWT FILTER
            .addFilterBefore(jwtFilter,
                    org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ✅ CORS CONFIG (CLEAN VERSION)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // frontend origin
        config.setAllowedOrigins(List.of("http://localhost:5173"));

        // allowed methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // allowed headers
        config.setAllowedHeaders(List.of("*"));

        // allow token (important for JWT)
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}