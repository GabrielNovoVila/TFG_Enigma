package com.example.enigma.Controlador;

import com.example.enigma.Servicios.AutenticacionServicio;
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
    public Map<String, String> refresh(@RequestBody Map<String, String> body) {

        String refreshToken = body.get("refreshToken");

        String email = jwtService.validarToken(refreshToken);

        String newAccessToken = jwtService.generarAccessToken(email);

        return Map.of("accessToken", newAccessToken);
    }
}