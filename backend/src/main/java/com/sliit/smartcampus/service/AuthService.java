package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enumtypes.Role;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.config.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtService jwtService;

    public String register(User user) {
        user.setPassword(encoder.encode(user.getPassword()));

        if (user.getRole() == null) {
            user.setRole(Role.STUDENT);
        }

        repo.save(user);
        return "Registered successfully";
    }

    public String login(String email, String password) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // FIX ONLY (no logic change, just method fix)
        return jwtService.generateToken(email, user.getRole().name());
    }
}