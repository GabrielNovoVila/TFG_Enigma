package com.example.enigma;

import com.example.enigma.Controlador.AutenticacionControlador;
import com.example.enigma.Servicios.AutenticacionServicio;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = AutenticacionControlador.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, OAuth2ClientAutoConfiguration.class}
)
@AutoConfigureMockMvc(addFilters = false)
class AutenticacionControladorEndpointTests {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    AutenticacionServicio autenticacionServicio;

    @Test
    void refreshDevuelveAccessTokenConRefreshTokenValido() throws Exception {
        when(autenticacionServicio.validarToken("refresh-valido")).thenReturn("usuario@example.com");
        when(autenticacionServicio.obtenerFoto("refresh-valido")).thenReturn("https://example.com/foto.png");
        when(autenticacionServicio.generarAccessToken("usuario@example.com", "https://example.com/foto.png"))
                .thenReturn("access-nuevo");

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"refresh-valido"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-nuevo"));
    }

    @Test
    void refreshDevuelve401SiFaltaToken() throws Exception {
        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Refresh token faltante"));
    }

    @Test
    void refreshDevuelve401SiTokenEsBlanco() throws Exception {
        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"   "}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Refresh token faltante"));
    }

    @Test
    void refreshDevuelve401SiTokenNoEsValido() throws Exception {
        when(autenticacionServicio.validarToken("refresh-invalido"))
                .thenThrow(new RuntimeException("token no valido"));

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"refresh-invalido"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Refresh token invalido o caducado"));
    }
}
