package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.AuthRequest;
import com.sliit.smartcampus.dto.AuthResponse;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.config.JwtService;
import com.sliit.smartcampus.service.RoleResolver;
import com.sliit.smartcampus.enumtypes.Role;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository repo;
    private final JwtService jwtService;
    private final RoleResolver roleResolver;
    private final PasswordEncoder passwordEncoder;

    // ✅ REGISTER
    @PostMapping("/register")
    public String register(@Valid @RequestBody User user) {

        // role auto assign (NO CHANGE)
        Role role = roleResolver.getRoleByEmail(user.getEmail());
        user.setRole(role);

        // hash password (ONLY security fix)
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        repo.save(user);

        return "Registered as " + role.name();
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {

        User user = repo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        Role role = user.getRole();

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token, role.name());
    }
}