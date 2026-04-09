package com.example.enigma.Servicios;

import com.example.enigma.Modelo.DTO.CifrarDTO;
import com.example.enigma.Modelo.DTO.M3DTO;
import com.example.enigma.Modelo.M3;
import com.example.enigma.Modelo.Rotor;
import com.example.enigma.Repositorio.M3Repo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.UUID;

@Service
public class M3Servicio {
    M3Repo m3Repo;
    public M3Servicio(M3Repo m3Repo) {
        this.m3Repo = m3Repo;
    }


    public M3DTO crearMaquina(){

        // Aseguramos que el "id" creado no exista ya (es improbable, pero existe la posibilidad)
        String id=crearId();
        while(m3Repo.findById(id).isEmpty()){
            id=crearId();
        }

        // Creamos la máquina y la guardamos en el repositorio
        M3 m3=new M3(id);
        m3Repo.save(m3); // TODO comprobar si aquí tengo que guardar m3 o m3DTO

        // Devolvemos el DTO de la máquina creada
        return new M3DTO(m3);
    }

    public M3DTO cambiarReflector(String id){
        M3 maquina=null;

        // Buscamos la máquina, si existe, se cambia el reflector
        var m3=m3Repo.findById(id);
        if(m3.isPresent()){
            maquina=m3.get();

            // Al haber solo 2 tipos de reflector, puede ser definido fácilmente con 0 o 1
            maquina.reflector.setTipo(1-maquina.reflector.getTipo());
        }

        // Devolvemos el DTO de la máquina editada
        return new M3DTO(maquina);
    }

    public M3DTO cambiarRotores(String id, ArrayList<Integer> rotores, ArrayList<String> ring_settings){
        M3 maquina=null;

        // Buscamos la máquina
        var m3=m3Repo.findById(id);

        if(m3.isPresent()){
            maquina=m3.get();

            // Vamos rotor por rotor de la máquina cambiando sus ajustes
            for(int i=0;i<3;i++){
                Rotor rotor=maquina.rotores.get(i);

                rotor.setTipo(rotores.get(i));
                rotor.ring_setting=maquina.alfabeto_letras.indexOf(ring_settings.get(i));
            }

        }
        // Devolvemos el DTO de la máquina editada
        return new M3DTO(maquina);

    }

    public boolean eliminarMaquina(String id){
        var m3 = m3Repo.findById(id);

        // Si la máquina está presente en el repositorio, se devuelve true
        if(m3.isPresent()){
            m3Repo.deleteById(id);
            return true;
        }

        // Si la máquina no existía (no estaba registrada en el repositorio), se devuelve false
        return false;
    }

    public CifrarDTO cifrar(String id, char a){
        M3 maquina;
        String nuevo;

        // Comprobamos que la máquina exista

        var m3=m3Repo.findById(id);
        if(m3.isPresent()){
            maquina=m3.get();
        }else return null;

        // Convertimos a String para poder hacer un uppercase

        String letra=String.valueOf(a);
        letra=letra.toUpperCase();

        nuevo = maquina.cables.getOrDefault(letra, letra);

        // Sumamos la posición al rotor.
        // Si llegamos a la posición de cambio, habrá que cambiar también el siguiente
        // Esto habrá que comprobarlo cada vez que cambiamos uno

        maquina.rotores.getLast().sumarPosicion();

        for(int i=2;i>=0;i--){
           if(maquina.rotores.get(i).posicion==maquina.rotores.get(i).letra_cambio){
               if(i==0) maquina.rotores.getLast().sumarPosicion();
               else maquina.rotores.get(i-1).sumarPosicion();
           }
        }

        for(int i=2;i>=0;i--){
            Rotor rotor=maquina.rotores.get(i);

            nuevo=cifrarRotor(maquina, rotor, nuevo);
        }

        // Reflector
        nuevo=maquina.alfabeto_letras.get(maquina.reflector.alfabeto[maquina.alfabeto_letras.indexOf(nuevo)]);

        // Volvemos a ir rotor por rotor cambiando la letra
        for(Rotor rotor:maquina.rotores){
            nuevo=cifrarRotor(maquina, rotor, nuevo);
        }

        // Miramos el cable, de nuevo
        nuevo = maquina.cables.getOrDefault(letra, letra);

        M3DTO maquinadto=new M3DTO(maquina);

        return new CifrarDTO(nuevo, maquinadto);
    }

    // TODO Implementar el crear un ID
    private String crearId(){
        String id= UUID.randomUUID().toString();
        System.out.println(id);

        return id;
    }

    private String cifrarRotor(M3 maquina, Rotor rotor, String a){
        // Calculamos offset (la posición menos la configuración inicial)
        int offset=rotor.posicion-rotor.ring_setting;

        // Convertimos la letra en base a ese offset (Se le suma el offset)
        String nuevo=maquina.alfabeto_letras.get(maquina.alfabeto_letras.indexOf(a)+offset);

        // Aplicamos la traducción del rotor
        nuevo=maquina.alfabeto_letras.get(rotor.alfabeto[maquina.alfabeto_letras.indexOf(nuevo)]);

        // Convertimos la letra resultante en base al offset, de nuevo (Se le resta el offset)
        nuevo=maquina.alfabeto_letras.get(maquina.alfabeto_letras.indexOf(nuevo)-offset);

        // Devolvemos la letra resultante
        return nuevo;
    }
}
