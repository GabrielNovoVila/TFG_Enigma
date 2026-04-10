package com.example.enigma.Controlador;
import com.example.enigma.Modelo.DTO.CifrarDTO;
import com.example.enigma.Modelo.DTO.M3DTO;
import com.example.enigma.Servicios.M3Servicio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
@RequestMapping("m3")
public class M3Controller {
    private final M3Servicio servicio;

    public M3Controller(M3Servicio servicio) {
        this.servicio = servicio;
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

    //TODO POST Y DELETE a /{id}/cables para hacer put y remove

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
    ResponseEntity<M3DTO> cambiarRotores(@PathVariable String id, @RequestBody ArrayList<Integer> rotores, @RequestBody ArrayList<String> ring_settings){
        M3DTO m3=servicio.cambiarRotores(id, rotores, ring_settings);

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
        return new ResponseEntity<>(cifrarDTO, HttpStatus.OK);
    }
}
