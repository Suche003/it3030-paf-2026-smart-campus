package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    // =========================
    // GET PROFILE
    // =========================
    @GetMapping("/{email}")
    public User getProfile(@PathVariable String email) {
        return repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // =========================
    // UPDATE PROFILE
    // =========================
    @PutMapping("/{email}")
    public User updateProfile(@PathVariable String email,
                              @RequestBody User updatedUser) {

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(updatedUser.getName());

        // password optional
        if (updatedUser.getPassword() != null &&
            !updatedUser.getPassword().isEmpty()) {
            user.setPassword(encoder.encode(updatedUser.getPassword()));
        }

        return repo.save(user);
    }

    // =========================
    // DELETE PROFILE
    // =========================
    @DeleteMapping("/{email}")
    public String deleteProfile(@PathVariable String email) {

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        repo.delete(user);

        return "Profile deleted successfully";
    }
}