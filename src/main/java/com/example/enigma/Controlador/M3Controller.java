package com.example.enigma.Controlador;
import com.example.enigma.Modelo.DTO.CablesDTO;
import com.example.enigma.Modelo.DTO.CifrarDTO;
import com.example.enigma.Modelo.DTO.ConfigDTO;
import com.example.enigma.Modelo.DTO.M3DTO;
import com.example.enigma.Servicios.M3Servicio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
public class M3Controller {
    private final M3Servicio servicio;
    private final M3Servicio m3Servicio;

    public M3Controller(M3Servicio servicio, M3Servicio m3Servicio) {
        this.servicio = servicio;
        this.m3Servicio = m3Servicio;
    }

    @PatchMapping("{id}")
    ResponseEntity<M3DTO> cambiarReflector(@PathVariable String id){
        M3DTO m3=servicio.cambiarReflector(id);

        // Si existe, 200 OK
        if(m3!=null){
            return new ResponseEntity<>(m3, HttpStatus.OK);
        }

        // Si no existe, 404 NOT FOUND
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    ResponseEntity<M3DTO> crearMaquina(){
        M3DTO m3=servicio.crearMaquina();

        // Devolvemos la máquina creada (201 CREATED)
        return new ResponseEntity<>(m3, HttpStatus.CREATED);
    }

    @DeleteMapping("{id}")
    ResponseEntity<Void> eliminarMaquina(@PathVariable String id){
        boolean eliminado= servicio.eliminarMaquina(id);

        if (eliminado) {
            // Si se eliminó correctamente, devolvemos 204 No Content
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            // Si no se encontró el usuario, devolvemos 404 Not Found
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("{id}")
    ResponseEntity<M3DTO> cambiarRotores(@PathVariable String id, @RequestBody ConfigDTO config){
        M3DTO m3=servicio.cambiarRotores(id, config);

        // Si existe, 200 OK
        if(m3!=null){
            return new ResponseEntity<>(m3, HttpStatus.OK);
        }

        // Si no existe, 404 NOT FOUND
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("{id}/cifrar")
    ResponseEntity<CifrarDTO> cifrar(@RequestBody String caracter, @PathVariable String id){
        // Cifrar DTO es un DTO que conforma la máquina y la letra resultante del cifrado
        CifrarDTO cifrarDTO=servicio.cifrar(id,caracter);

        // Devolvemos la máquina editada junto al carácter encriptado
        // (Cuando encriptamos un carácter, cambian las posiciones de los rotores)
        if(cifrarDTO!=null){
            return new ResponseEntity<>(cifrarDTO, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/{id}/cables")
    ResponseEntity<M3DTO> meterCables(@PathVariable String id, @RequestBody CablesDTO cable){
        M3DTO m3dto= m3Servicio.ponerCables(id, cable);
        if(m3dto!=null){
            return new ResponseEntity<>(m3dto, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("{id}/cables")
    ResponseEntity<M3DTO> sacarCables(@PathVariable String id, @RequestBody CablesDTO cable){
        M3DTO m3dto= m3Servicio.sacarCables(id, cable);

        if(m3dto!=null){
            return new ResponseEntity<>(m3dto, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/")
    public Object home(@AuthenticationPrincipal OAuth2User user) {
        return user.getAttributes();
    }
}
