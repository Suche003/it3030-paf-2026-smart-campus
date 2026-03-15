package com.sliit.smartcampus.config;

import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enumtypes.Role;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.service.RoleResolver;

import jakarta.servlet.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.*;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository repo;
    private final RoleResolver roleResolver;

    public OAuth2SuccessHandler(JwtService jwtService,
                                UserRepository repo,
                                RoleResolver roleResolver) {
        this.jwtService = jwtService;
        this.repo = repo;
        this.roleResolver = roleResolver;
    }

   @Override
public void onAuthenticationSuccess(HttpServletRequest request,
                                    HttpServletResponse response,
                                    Authentication authentication) throws IOException {

    try {
        OAuth2User oAuthUser = (OAuth2User) authentication.getPrincipal();

        String email = oAuthUser.getAttribute("email");

        // 🔥 FIX 1: email null check
        if (email == null) {
            response.sendRedirect("http://localhost:5173/login?error=email_not_found");
            return;
        }

        Role role = roleResolver.getRoleByEmail(email);

        // 🔥 FIX 2: prevent null crash (NO logic change)
        if (role == null) {
            throw new RuntimeException("Role is null for email: " + email);
        }

        User user = repo.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .role(role)
                    .build();
            return repo.save(newUser);
        });

        String token = jwtService.generateToken(email);

        response.sendRedirect(
                "http://localhost:5173/login?token=" + token +
                        "&role=" + user.getRole().name()+
                        "&email=" + email 
        );

    } catch (Exception e) {
        e.printStackTrace(); // 🔥 see real error in console
        response.sendRedirect("http://localhost:5173/login?error=server_error");
    }
}
}