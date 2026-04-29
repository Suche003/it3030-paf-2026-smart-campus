package com.sliit.smartcampus.config;

import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enumtypes.Role;
import com.sliit.smartcampus.repository.UserRepository;
import jakarta.servlet.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository repo;

    public OAuth2SuccessHandler(JwtService jwtService, UserRepository repo) {
        this.jwtService = jwtService;
        this.repo = repo;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        try {
            Role forcedRole = Role.STUDENT;

            String provider = ((OAuth2AuthenticationToken) authentication)
                    .getAuthorizedClientRegistrationId();

            OAuth2User oAuthUser = (OAuth2User) authentication.getPrincipal();

            String email = oAuthUser.getAttribute("email");
            String name = oAuthUser.getAttribute("name");

            if (email == null || email.isBlank()) {
                String id = oAuthUser.getAttribute("sub");
                email = provider + "_" + id + "@unigo.oauth";
            }

            if (name == null || name.isBlank()) {
                name = "Google User";
            }

            User user = repo.findByEmail(email).orElse(new User());

            user.setEmail(email);
            user.setName(name);

            // ✅ GOOGLE LOGIN USERS ALWAYS STUDENT
            user.setRole(forcedRole);

            repo.save(user);

            String token = jwtService.generateToken(email, forcedRole.name());

            String redirectUrl = "http://localhost:5173/login"
                    + "?token=" + encode(token)
                    + "&role=" + forcedRole.name()
                    + "&email=" + encode(email)
                    + "&name=" + encode(name)
                    + "&provider=" + encode(provider);

            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("http://localhost:5173/login?error=server_error");
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}