package com.example.enigma.Configuracion;

import com.example.enigma.Filtros.FiltroJWT;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final OAuth2SuccessHandler successHandler;
    private final FiltroJWT filtroJWT;

    public SecurityConfig(OAuth2SuccessHandler successHandler, FiltroJWT filtroJWT) {
        this.successHandler = successHandler;
        this.filtroJWT = filtroJWT;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/public/**", "/login/**", "/oauth2/**", "/auth/refresh", "/m3/**").permitAll()
                        .anyRequest().authenticated()
                )

                .exceptionHandling(e -> e
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"No autorizado - Token faltante o invalido\"}");
                        })
                )

                .oauth2Login(oauth -> oauth.successHandler(successHandler))
                .addFilterBefore(filtroJWT, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
