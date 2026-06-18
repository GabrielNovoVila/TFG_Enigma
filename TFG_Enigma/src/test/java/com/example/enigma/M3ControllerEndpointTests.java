package com.example.enigma;

import com.example.enigma.Controlador.M3Controller;
import com.example.enigma.Modelo.DTO.CifrarDTO;
import com.example.enigma.Modelo.DTO.ConfigDTO;
import com.example.enigma.Modelo.DTO.M3DTO;
import com.example.enigma.Modelo.M3;
import com.example.enigma.Servicios.M3Servicio;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = M3Controller.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, OAuth2ClientAutoConfiguration.class}
)
@AutoConfigureMockMvc(addFilters = false)
class M3ControllerEndpointTests {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    M3Servicio m3Servicio;

    @Test
    void crearMaquinaDevuelve201YMaquinaCreada() throws Exception {
        M3DTO maquina = maquina("m3-1");
        when(m3Servicio.crearMaquina()).thenReturn(maquina);

        mockMvc.perform(post("/m3"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("m3-1"))
                .andExpect(jsonPath("$.rotores", hasSize(3)))
                .andExpect(jsonPath("$.reflector").value(0));
    }

    @Test
    void cambiarReflectorDevuelve200SiExiste() throws Exception {
        M3DTO maquina = maquina("m3-1");
        maquina.setReflector(1);
        when(m3Servicio.cambiarReflector("m3-1")).thenReturn(maquina);

        mockMvc.perform(patch("/m3/m3-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reflector").value(1));
    }

    @Test
    void cambiarReflectorDevuelve404SiNoExiste() throws Exception {
        when(m3Servicio.cambiarReflector("no-existe")).thenReturn(null);

        mockMvc.perform(patch("/m3/no-existe"))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarMaquinaDevuelve204SiExiste() throws Exception {
        when(m3Servicio.eliminarMaquina("m3-1")).thenReturn(true);

        mockMvc.perform(delete("/m3/m3-1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void eliminarMaquinaDevuelve404SiNoExiste() throws Exception {
        when(m3Servicio.eliminarMaquina("no-existe")).thenReturn(false);

        mockMvc.perform(delete("/m3/no-existe"))
                .andExpect(status().isNotFound());
    }

    @Test
    void cambiarRotoresDevuelve200YAplicaConfiguracion() throws Exception {
        ConfigDTO config = new ConfigDTO();
        config.setRotores(new ArrayList<>(List.of(2, 3, 1)));
        config.setRing_settings(new ArrayList<>(List.of("Y", "Z", "N")));
        config.setRotor_positions(new ArrayList<>(List.of(0, 1, 2)));

        M3DTO maquina = maquina("m3-1");
        maquina.setRotores(new ArrayList<>(List.of(2, 3, 1)));
        maquina.setRotores_settings(new ArrayList<>(List.of("Y", "Z", "N")));
        maquina.setRotores_posiciones(List.of(0, 1, 2));
        when(m3Servicio.cambiarRotores(eq("m3-1"), any(ConfigDTO.class))).thenReturn(maquina);

        mockMvc.perform(put("/m3/m3-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(config)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rotores[0]").value(2))
                .andExpect(jsonPath("$.rotores_settings[1]").value("Z"))
                .andExpect(jsonPath("$.rotores_posiciones[2]").value(2));
    }

    @Test
    void cambiarRotoresDevuelve404SiNoExiste() throws Exception {
        ConfigDTO config = new ConfigDTO();
        config.setRotores(new ArrayList<>(List.of(0, 1, 2)));
        config.setRing_settings(new ArrayList<>(List.of("A", "A", "A")));

        when(m3Servicio.cambiarRotores(eq("no-existe"), any(ConfigDTO.class))).thenReturn(null);

        mockMvc.perform(put("/m3/no-existe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(config)))
                .andExpect(status().isNotFound());
    }

    @Test
    void cifrarDevuelveResultadoMaquinaYPasos() throws Exception {
        CifrarDTO respuesta = new CifrarDTO(
                "B",
                maquina("m3-1"),
                new ArrayList<>(List.of("ROTORES: AAB", "INPUT CIFRAR: A"))
        );
        when(m3Servicio.cifrar("m3-1", "A")).thenReturn(respuesta);

        mockMvc.perform(post("/m3/m3-1/cifrar")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("A"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.letra").value("B"))
                .andExpect(jsonPath("$.maquina.id").value("m3-1"))
                .andExpect(jsonPath("$.pasos", hasSize(2)));
    }

    @Test
    void cifrarDevuelve404SiNoExiste() throws Exception {
        when(m3Servicio.cifrar("no-existe", "A")).thenReturn(null);

        mockMvc.perform(post("/m3/no-existe/cifrar")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("A"))
                .andExpect(status().isNotFound());
    }

    @Test
    void descifrarDevuelveResultadoMaquinaYPasos() throws Exception {
        CifrarDTO respuesta = new CifrarDTO(
                "A",
                maquina("m3-1"),
                new ArrayList<>(List.of("ROTORES: AAB", "INPUT DESCIFRAR: B"))
        );
        when(m3Servicio.descifrar("m3-1", "B")).thenReturn(respuesta);

        mockMvc.perform(post("/m3/m3-1/descifrar")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("B"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.letra").value("A"))
                .andExpect(jsonPath("$.pasos[1]").value("INPUT DESCIFRAR: B"));
    }

    @Test
    void descifrarDevuelve404SiNoExiste() throws Exception {
        when(m3Servicio.descifrar("no-existe", "B")).thenReturn(null);

        mockMvc.perform(post("/m3/no-existe/descifrar")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("B"))
                .andExpect(status().isNotFound());
    }

    @Test
    void meterCablesDevuelve200SiExiste() throws Exception {
        M3DTO maquina = maquina("m3-1");
        when(m3Servicio.ponerCables(eq("m3-1"), any())).thenReturn(maquina);

        mockMvc.perform(post("/m3/m3-1/cables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"a":0,"b":1}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("m3-1"));
    }

    @Test
    void meterCablesDevuelve404SiNoExiste() throws Exception {
        when(m3Servicio.ponerCables(eq("no-existe"), any())).thenReturn(null);

        mockMvc.perform(post("/m3/no-existe/cables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"a":0,"b":1}
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void sacarCablesDevuelve200SiExiste() throws Exception {
        M3DTO maquina = maquina("m3-1");
        when(m3Servicio.sacarCables(eq("m3-1"), any())).thenReturn(maquina);

        mockMvc.perform(delete("/m3/m3-1/cables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"a":0,"b":1}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("m3-1"));
    }

    @Test
    void sacarCablesDevuelve404SiNoExiste() throws Exception {
        when(m3Servicio.sacarCables(eq("no-existe"), any())).thenReturn(null);

        mockMvc.perform(delete("/m3/no-existe/cables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"a":0,"b":1}
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void homeSinUsuarioOAuthDevuelveListaVacia() throws Exception {
        mockMvc.perform(get("/m3/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void invocaServicioDeCifradoConLetraRecibida() throws Exception {
        when(m3Servicio.cifrar(eq("m3-1"), eq("A"))).thenReturn(
                new CifrarDTO("B", maquina("m3-1"), new ArrayList<>())
        );

        mockMvc.perform(post("/m3/m3-1/cifrar")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("A"))
                .andExpect(status().isOk());

        verify(m3Servicio).cifrar("m3-1", "A");
    }

    private M3DTO maquina(String id) {
        return new M3DTO(new M3(id));
    }
}
