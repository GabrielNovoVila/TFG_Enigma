package com.example.enigma.Servicios;

import com.example.enigma.Modelo.M3;
import com.example.enigma.Repositorio.M3Repo;
import org.springframework.stereotype.Service;

@Service
public class M3Servicio {
    M3Repo m3Repo;
    public M3Servicio(M3Repo m3Repo) {
        this.m3Repo = m3Repo;
    }


    public M3 crearMaquina(){

        // Comprobamos que el id creado no exista ya (es improbable, pero existe la posibilidad)
        String id=crearId();
        while(m3Repo.findById(id).isEmpty()){
            id=crearId();
        }

        // Creamos la máquina y la guardamos en el repositorio
        M3 m3=new M3(id);
        m3Repo.save(m3);

        return m3;
    }

    public M3 cambiarReflector(){
        return new M3(crearId());
    }

    public M3 cambiarRotores(){
        return new M3(crearId());
    }

    public boolean eliminarMaquina(String id){
        var m3 = m3Repo.findById(id);

        if(m3.isPresent()){
            m3Repo.deleteById(id);
            return true;
        }

        return false;
    }

    public M3 cifrar(char a){
        return new M3(crearId());
    }

    private String crearId(){
        return "";
    }
}
