package com.sliit.smartcampus.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;


import java.util.Date;

import javax.crypto.SecretKey;

@Service
public class JwtService {

    private final String SECRET = "mysecretkeymysecretkeymysecretkey12";

    private SecretKey getSignKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email) // ✅ new method
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(getSignKey())
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())   // ✅ replaces setSigningKey
                .build()
                .parseSignedClaims(token)  // ✅ replaces parseClaimsJws
                .getPayload();
    }
}