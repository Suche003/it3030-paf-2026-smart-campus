package com.sliit.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String role;

    private Long id;
    private String name;
    private String email;
}