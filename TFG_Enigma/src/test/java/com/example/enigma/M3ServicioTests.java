package com.example.enigma;

import com.example.enigma.Modelo.DTO.CifrarDTO;
import com.example.enigma.Modelo.DTO.M3DTO;
import com.example.enigma.Modelo.M3;
import com.example.enigma.Repositorio.M3Repo;
import com.example.enigma.Servicios.M3Servicio;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class M3ServicioTests {

    @Test
    void cifraConOffsetsNegativosSinSalirDelAlfabeto() {
        M3Repo repo = mock(M3Repo.class);
        M3DTO maquina = new M3DTO(new M3("prueba-offset-negativo"));
        maquina.setRotores(new ArrayList<>(List.of(2, 3, 1)));
        maquina.setRotores_settings(new ArrayList<>(List.of("Y", "Z", "N")));
        maquina.setRotores_posiciones(List.of(0, 0, 0));

        when(repo.findById(maquina.getId())).thenReturn(Optional.of(maquina));
        when(repo.save(any(M3DTO.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CifrarDTO resultado = new M3Servicio(repo).cifrar(maquina.getId(), "A");

        assertNotNull(resultado);
        assertNotNull(resultado.getLetra());
        assertEquals(1, resultado.getLetra().length());
    }
}
