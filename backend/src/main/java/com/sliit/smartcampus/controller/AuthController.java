package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.config.JwtService;
import com.sliit.smartcampus.dto.AuthRequest;
import com.sliit.smartcampus.dto.AuthResponse;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enumtypes.Role;
import com.sliit.smartcampus.repository.UserRepository;
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
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {

        Map<String, String> response = new HashMap<>();

        if (repo.findByEmail(user.getEmail()).isPresent()) {
            response.put("message", "Email already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        // Public registration must always create STUDENT users
        user.setRole(Role.STUDENT);

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        repo.save(user);

        response.put("message", "Registered as " + user.getRole().name());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {

        User user = repo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        AuthResponse authResponse = new AuthResponse(
                token,
                user.getRole().name()
        );

        return ResponseEntity.ok(authResponse);
    }
}