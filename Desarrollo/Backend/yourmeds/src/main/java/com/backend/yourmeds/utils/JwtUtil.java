package com.backend.yourmeds.utils;

import com.backend.yourmeds.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey key = Keys.hmacShaKeyFor("1d19c2e6bad088165549d09a5b696484572ecbdc8f5cc10477f8b31a80094e68"
            .getBytes(StandardCharsets.UTF_8)
    );

    private Claims getClaims(String token){
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token){
        return getClaims(token).getSubject();
    }

    private boolean isTokenExpired(String token){
        return getClaims(token).getExpiration().before(new Date());
    }

    public boolean isTokenValid(String token, UserDetails userDetails){
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public String generateToken(User user){
        long expirationMillis = 1000 * 60 * 60 * 24; // Expiración de 24 hrs
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMillis);
        return Jwts.builder()
                .subject(user.getEmail())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }
}
