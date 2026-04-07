package com.example.enigma.Controlador;
import com.example.enigma.Modelo.M3;
import com.example.enigma.Servicios.M3Servicio;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("m3")
@NullMarked
public class M3Controller {
    private final M3Servicio servicio;
    private final M3Servicio m3Servicio;

    public M3Controller(M3Servicio servicio, M3Servicio m3Servicio) {
        this.servicio = servicio;
        this.m3Servicio = m3Servicio;
    }

    @PatchMapping
    ResponseEntity<M3> cambiarReflector(@RequestBody String id){
        M3 m3=servicio.cambiarReflector(id);

        return new ResponseEntity<>(m3, HttpStatus.CREATED);
    }

    @PostMapping
    ResponseEntity<M3> crearMaquina(){
        M3 m3=servicio.crearMaquina();

        return new ResponseEntity<>(m3, HttpStatus.CREATED);
    }

    @DeleteMapping
    ResponseEntity<M3> eliminarMaquina(@RequestBody String id){
        servicio.eliminarMaquina(id);

        boolean eliminado = m3Servicio.eliminarMaquina(id);

        if (eliminado) {
            // Si se eliminó correctamente, devolvemos 204 No Content
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            // Si no se encontró el usuario, devolvemos 404 Not Found
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping
    ResponseEntity<M3> cambiarRotores(@RequestBody String id){
        M3 m3=servicio.cambiarRotores(id);

        return new ResponseEntity<>(m3, HttpStatus.CREATED);
    }

    @GetMapping
    ResponseEntity<M3> cifrar(@RequestBody String id, char a){
        M3 m3=servicio.cifrar(id,a);

        return new ResponseEntity<>(m3, HttpStatus.CREATED);
    }
}
