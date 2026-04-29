package com.example.enigma.Configuracion;


import com.example.enigma.Servicios.AutenticacionServicio;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final AutenticacionServicio jwtService;

    public OAuth2SuccessHandler(AutenticacionServicio jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException {

        OAuth2User user = (OAuth2User) authentication.getPrincipal();

        String email = user.getAttribute("email");

        String token = jwtService.generarToken(email);

        response.setContentType("application/json");
        response.getWriter().write("""
            {"token":"%s"}
        """.formatted(token));
    }
}