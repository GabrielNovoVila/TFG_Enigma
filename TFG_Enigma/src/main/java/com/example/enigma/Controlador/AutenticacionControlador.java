package com.example.enigma.Controlador;

import com.example.enigma.Servicios.AutenticacionServicio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AutenticacionControlador {

    private final AutenticacionServicio jwtService;

    public AutenticacionControlador(AutenticacionServicio jwtService) {
        this.jwtService = jwtService;
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> body) {

        String refreshToken = body.get("refreshToken");

        if (refreshToken == null || refreshToken.isBlank()) {
            return new ResponseEntity<>(Map.of("error", "Refresh token faltante"), HttpStatus.UNAUTHORIZED);
        }

        try {
            String email = jwtService.validarToken(refreshToken);
            String newAccessToken = jwtService.generarAccessToken(email);

            return new ResponseEntity<>(Map.of("accessToken", newAccessToken), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Refresh token invalido o caducado"), HttpStatus.UNAUTHORIZED);
        }
    }
}
