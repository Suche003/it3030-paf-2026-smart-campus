package com.sliit.smartcampus.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity   
public class SecurityConfig {

    private final JwtAuthFilter jwtFilter;
    private final OAuth2SuccessHandler successHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            //  disable CSRF (API only)
            .csrf(csrf -> csrf.disable())

            //  CORS enable
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            //  no session (JWT system)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // public APIs (NO AUTH)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/oauth2/**").permitAll()
                .requestMatchers("/login/**").permitAll()

                // ADMIN ONLY API (FIXED PATH)
                .requestMatchers("/api/auth/admin/**").hasRole("ADMIN")

                // other APIs
               .requestMatchers("/api/notifications/**").authenticated()
                .requestMatchers("/api/profile/**").authenticated()

                .anyRequest().authenticated()
            )

            // OAuth login (keep if using google login)
            .oauth2Login(oauth ->
                oauth.successHandler(successHandler)
            )

            // JWT FILTER (IMPORTANT)
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    
    // CORS CONFIG (FRONTEND FIX)
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:5173"));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type"
        ));

        config.setExposedHeaders(List.of("Authorization"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}