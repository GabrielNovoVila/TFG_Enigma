package com.example.enigma.Servicios;

import com.example.enigma.Modelo.DTO.CifrarDTO;
import com.example.enigma.Modelo.DTO.M3DTO;
import com.example.enigma.Modelo.M3;
import com.example.enigma.Modelo.Rotor;
import com.example.enigma.Repositorio.M3Repo;
import org.springframework.stereotype.Service;

@Service
public class M3Servicio {
    M3Repo m3Repo;
    public M3Servicio(M3Repo m3Repo) {
        this.m3Repo = m3Repo;
    }


    public M3 crearMaquina(){

        // Comprobamos que el "id" creado no exista ya (es improbable, pero existe la posibilidad)
        String id=crearId();
        while(m3Repo.findById(id).isEmpty()){
            id=crearId();
        }

        // Creamos la máquina y la guardamos en el repositorio
        M3 m3=new M3(id);
        m3Repo.save(m3);

        return m3;
    }

    public M3 cambiarReflector(String id){
        M3 maquina=null;

        // Buscamos la máquina, si existe, se cambia el reflector
        var m3=m3Repo.findById(id);
        if(m3.isPresent()){
            maquina=m3.get();

            // Al haber solo 2 tipos de reflector, puede ser definido fácilmente con 0 o 1
            maquina.reflector.setTipo(1-maquina.reflector.getTipo());
        }

        //TODO tener en cuenta que puede sacar null
        return maquina;
    }

    public M3 cambiarRotores(String id){
        M3 maquina;

        var m3=m3Repo.findById(id);
        if(m3.isPresent()){
            maquina=m3.get();
            // TODO cambiar rotores (pienso que hay que mandar un DTO por las posiciones iniciales y esas movidas)

            return maquina;
        }else return null;
    }

    public boolean eliminarMaquina(String id){
        var m3 = m3Repo.findById(id);

        if(m3.isPresent()){
            m3Repo.deleteById(id);
            return true;
        }

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

        int offset;
        for(int i=2;i>=0;i--){
            Rotor rotor=maquina.rotores.get(i);

            // Calculamos offset (la posición menos la configuración inicial)
            offset=rotor.posicion-rotor.ring_setting;

            // Convertimos la letra en base a ese offset (Se le suma el offset)
            nuevo=maquina.alfabeto_letras.get(maquina.alfabeto_letras.indexOf(nuevo)+offset);

            // Aplicamos la traducción del rotor
            nuevo=maquina.alfabeto_letras.get(rotor.alfabeto[maquina.alfabeto_letras.indexOf(nuevo)]);

            // Convertimos la letra resultante en base al offset, de nuevo (Se le resta el offset)
            nuevo=maquina.alfabeto_letras.get(maquina.alfabeto_letras.indexOf(nuevo)-offset);
        }

        // Reflector
        nuevo=maquina.alfabeto_letras.get(maquina.reflector.alfabeto[maquina.alfabeto_letras.indexOf(nuevo)]);

        // Volvemos a ir rotor por rotor cambiando la letra
        for(Rotor rotor:maquina.rotores){
            // Calculamos offset (la posición menos la configuración inicial)
            offset=rotor.posicion-rotor.ring_setting;

            // Convertimos la letra en base a ese offset (Se le suma el offset)
            nuevo=maquina.alfabeto_letras.get(maquina.alfabeto_letras.indexOf(nuevo)+offset);

            // Aplicamos la traducción del rotor
            nuevo=maquina.alfabeto_letras.get(rotor.alfabeto[maquina.alfabeto_letras.indexOf(nuevo)]);

            // Convertimos la letra resultante en base al offset, de nuevo (Se le resta el offset)
            nuevo=maquina.alfabeto_letras.get(maquina.alfabeto_letras.indexOf(nuevo)-offset);
        }

        // Miramos el cable, de nuevo
        nuevo = maquina.cables.getOrDefault(letra, letra);

        return new CifrarDTO(nuevo, maquina);
    }

    private String crearId(){
        return "";
    }
}
