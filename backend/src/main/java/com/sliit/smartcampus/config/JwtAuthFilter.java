package com.sliit.smartcampus.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class JwtAuthFilter implements Filter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

    HttpServletRequest req = (HttpServletRequest) request;

    String header = req.getHeader("Authorization");

    try {
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            // 🔥 safe extraction
            String email = jwtService.extractEmail(token);

            if (email != null) {
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(email, null, null);

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
    } catch (Exception e) {
        // 🔥 IMPORTANT: prevent crash
        SecurityContextHolder.clearContext();
    }

    chain.doFilter(request, response);
}
}