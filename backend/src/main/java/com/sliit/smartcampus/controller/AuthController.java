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

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository repo;
    private final JwtService jwtService;
    private final RoleResolver roleResolver;
    private final PasswordEncoder passwordEncoder;

    // =========================
    // REGISTER (SAFE VERSION)
    // =========================
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {

        Map<String, String> response = new HashMap<>();

        // 🔥 check duplicate email (NO DATA CHANGE)
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            response.put("message", "Email already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        // 🔥 role assign only if null (NO DATA CHANGE)
        if (user.getRole() == null) {
            Role role = roleResolver.getRoleByEmail(user.getEmail());
            user.setRole(role);
        }

        // password encryption
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        repo.save(user);

        response.put("message", "Registered as " + user.getRole().name());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =========================
    // LOGIN (SAFE VERSION)
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {

        Map<String, String> response = new HashMap<>();

        User user = repo.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    throw new RuntimeException("Invalid email or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        Role role = user.getRole();

        String token = jwtService.generateToken(user.getEmail());

        AuthResponse authResponse = new AuthResponse(token, role.name());

        return ResponseEntity.ok(authResponse);
    }
}