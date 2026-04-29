package com.example.enigma.Servicios;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class AutenticacionServicio {

    // 1. Usa una constante para que la clave sea inmutable
    private static final String SECRET_STRING = "my-super-secret-key-must-be-at-least-32-chars-long!!";
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET_STRING.getBytes());

    public String generarToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key, Jwts.SIG.HS256) // Especifica explícitamente el algoritmo
                .compact();
    }

    public String validarToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (Exception e) {
            // 2. Imprime el error real en la consola para ver qué está pasando
            e.printStackTrace();
            throw new RuntimeException("Error en validación: " + e.getMessage());
        }
    }
}