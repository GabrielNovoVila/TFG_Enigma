package com.example.enigma.Filtros;

import com.example.enigma.Servicios.AutenticacionServicio;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class FiltroJWT extends OncePerRequestFilter {

    private final AutenticacionServicio jwtService;

    public FiltroJWT(AutenticacionServicio jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain
    ) throws ServletException, IOException {

        if ("/auth/refresh".equals(request.getServletPath())) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        System.out.println("DEBUG: Header recibido -> " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("DEBUG: El header no empieza con Bearer o es nulo");
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();
        System.out.println("DEBUG: Token extraido -> [" + token + "]");

        try {
            String email = jwtService.validarToken(token);
            System.out.println("DEBUG: Email validado correctamente -> " + email);

            UsernamePasswordAuthenticationToken authentication =
                    UsernamePasswordAuthenticationToken.authenticated(
                            email,
                            null,
                            List.of()
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            chain.doFilter(request, response);
        } catch (Exception e) {
            System.out.println("DEBUG: Error en validacion -> " + e.getMessage());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }
    }
}
