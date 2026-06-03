package com.example.enigma.Servicios;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class AutenticacionServicio {

    private static final String SECRET_STRING = "my-super-secret-key-must-be-at-least-32-chars-long!!";
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET_STRING.getBytes());

    public String generarAccessToken(String email) {
        return generarAccessToken(email, null);
    }

    public String generarAccessToken(String email, String picture) {
        var builder = Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 10));

        if(picture!=null && !picture.isBlank()){
            builder.claim("picture", picture);
        }

        return builder
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public String generarRefreshToken(String email) {
        return generarRefreshToken(email, null);
    }

    public String generarRefreshToken(String email, String picture) {
        var builder = Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7));

        if(picture!=null && !picture.isBlank()){
            builder.claim("picture", picture);
        }

        return builder
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public String obtenerFoto(String token) {
        try {
            Object picture = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("picture");

            return picture instanceof String ? (String) picture : null;
        } catch (Exception e) {
            return null;
        }
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
            throw new RuntimeException("Error en validacion: " + e.getMessage());
        }
    }
}
