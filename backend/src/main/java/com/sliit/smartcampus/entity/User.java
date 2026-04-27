package com.sliit.smartcampus.entity;

import com.sliit.smartcampus.enumtypes.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //  FIX: OAuth users may not have name
    @Column(nullable = true)
    private String name;

    // Email required (OK)
    @Column(unique = true, nullable = false)
    private String email;

    // FIX: OAuth users don't use password
    @Column(nullable = true)
    private String password;

    // Role stored in DB
    @Enumerated(EnumType.STRING)
    private Role role;
}