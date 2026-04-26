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

            String provider =
                    ((OAuth2AuthenticationToken) authentication)
                            .getAuthorizedClientRegistrationId();

            OAuth2User oAuthUser = (OAuth2User) authentication.getPrincipal();

            String email = oAuthUser.getAttribute("email");
            String name = oAuthUser.getAttribute("name");

            // fallback (safe)
            if (email == null) {
                String id = oAuthUser.getAttribute("sub");
                email = "google_" + id + "@gmail.com";
            }

            User user = repo.findByEmail(email).orElse(null);

            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setName(name); // ✅ Google name save
                user.setRole(Role.STUDENT);
            } else {
                // ALWAYS UPDATE GOOGLE DATA
                user.setName(name);
                user.setRole(Role.STUDENT);
            }

            repo.save(user);

            String token = jwtService.generateToken(email, user.getRole().name());

            response.sendRedirect(
                    "http://localhost:5173/login?token=" + token +
                            "&role=" + user.getRole().name() +
                            "&email=" + email +
                            "&name=" + name +
                            "&provider=" + provider
            );

        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("http://localhost:5173/login?error=server_error");
        }
    }
}