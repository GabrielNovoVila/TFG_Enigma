package com.example.enigma.Servicios;

import com.example.enigma.Modelo.Cable;
import com.example.enigma.Modelo.DTO.CablesDTO;
import com.example.enigma.Modelo.DTO.CifrarDTO;
import com.example.enigma.Modelo.DTO.ConfigDTO;
import com.example.enigma.Modelo.DTO.M3DTO;
import com.example.enigma.Modelo.M3;
import com.example.enigma.Modelo.Rotor;
import com.example.enigma.Repositorio.M3Repo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
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
        while(m3Repo.findById(id).isPresent()){
            id=crearId();
        }

        System.out.println("Acabé de crear el id");

        // Creamos la máquina y la guardamos en el repositorio
        M3DTO m3=new M3DTO(new M3(id));
        m3Repo.save(m3);

        // Devolvemos el DTO de la máquina creada
        return m3;
    }

    public M3DTO cambiarReflector(String id){
        M3DTO maquina=null;

        // Buscamos la máquina, si existe, se cambia el reflector
        var m3=m3Repo.findById(id);
        if(m3.isPresent()){
            maquina=m3.get();

            // Al haber solo 2 tipos de reflector, puede ser definido fácilmente con 0 o 1
            maquina.setReflector(1-maquina.getReflector());

            // Actualizamos la máquina en la BD
            m3Repo.save(maquina);
        }

        // Devolvemos el DTO de la máquina editada
        return maquina;
    }

    public M3DTO cambiarRotores(String id, ConfigDTO config){
        M3DTO maquina=null;

        // Buscamos la máquina
        var m3=m3Repo.findById(id);

        if(m3.isPresent()){
            maquina=m3.get();

            // Vamos rotor por rotor de la máquina cambiando sus ajustes
            maquina.setRotores(config.getRotores());
            maquina.setRotores_settings(config.getRing_settings());
            if(config.getRotor_positions()!=null){
                maquina.setRotores_posiciones(config.getRotor_positions());
            }

            // Actualizamos la máquina en la BD
            m3Repo.save(maquina);
        }
        // Devolvemos el DTO de la máquina editada
        return maquina;

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

    public CifrarDTO cifrar(String id, String a){
        return procesarLetra(id, a, false);
    }

    public CifrarDTO descifrar(String id, String a){
        return procesarLetra(id, a, true);
    }

    private CifrarDTO procesarLetra(String id, String a, boolean descifrando){
        M3DTO maquinaDTO;
        M3 maquina;
        String nuevo;
        ArrayList<String> pasos=new ArrayList<>();
        String operacion=descifrando ? "DESCIFRAR" : "CIFRAR";

        // Comprobamos que la máquina exista
        System.out.println("Hay "+m3Repo.count()+ "máquinas");

        var m3=m3Repo.findById(id);
        if(m3.isPresent()){
            maquinaDTO=m3.get();
            System.out.println("DESDE BD: " + maquinaDTO.getRotores());
        }else return null;

        // Convertimos el DTO obtenido de la BD a una máquina para hacerlo más intuitivo
        maquina=new M3(maquinaDTO);

        // Le sumamos la posición al rotor.
        // Si llegamos a la posición de cambio, habrá que cambiar también el siguiente
        // Esto habrá que comprobarlo cada vez que cambiamos uno

        maquina.rotores.getLast().sumarPosicion();

        if(maquina.rotores.getLast().posicion==maquina.rotores.getLast().letra_cambio){
            maquina.rotores.get(1).sumarPosicion();
            if(maquina.rotores.get(1).posicion==maquina.rotores.get(1).letra_cambio){
                maquina.rotores.getFirst().sumarPosicion();
                if(maquina.rotores.getFirst().posicion==maquina.rotores.getFirst().letra_cambio){
                    maquina.rotores.getFirst().sumarPosicion();
                }
            }
        }

        StringBuilder rotores= new StringBuilder();
        for(Rotor rotor: maquina.rotores){
            rotores.append(maquina.alfabeto_letras.get(rotor.posicion));
        }

        pasos.add("ROTORES: "+rotores);

        // Convertimos a mayúscula
        a=a.toUpperCase();

        pasos.add("INPUT "+operacion+": "+a);

        // Si hay cable asociado a esta letra, transformamos la letra, si no, se mantiene igual
        nuevo = maquina.cables.getOrDefault(a, a);

        pasos.add("CABLES: "+nuevo);

        for(int i=2;i>=0;i--){
            Rotor rotor=maquina.rotores.get(i);

            nuevo=descifrando
                    ? descifrarRotor(maquina, rotor, nuevo, false)
                    : cifrarRotor(maquina, rotor, nuevo, false);
            System.out.println("Letra tras rotor "+i+": "+nuevo);
            pasos.add("ROTOR "+rotor.getTipo()+": "+nuevo);
        }

        // Reflector
        nuevo=maquina.alfabeto_letras.get(maquina.reflector.alfabeto[maquina.alfabeto_letras.indexOf(nuevo)]);

        pasos.add("REFLECTOR: "+nuevo);

        // Volvemos a ir rotor por rotor cambiando la letra
        for(Rotor rotor:maquina.rotores){
            nuevo=descifrando
                    ? descifrarRotor(maquina, rotor, nuevo, true)
                    : cifrarRotor(maquina, rotor, nuevo, true);
            pasos.add("ROTOR "+rotor.getTipo()+": "+nuevo);
        }

        // Miramos el cable, de nuevo
        nuevo = maquina.cables.getOrDefault(nuevo, nuevo);
        pasos.add("CABLES: "+nuevo);

        maquinaDTO=new M3DTO(maquina);

        // Actualizamos la máquina en la BD
        System.out.println("ANTES DE GUARDAR: " + maquina.rotores);
        m3Repo.save(maquinaDTO);

        return new CifrarDTO(nuevo, maquinaDTO, pasos);
    }

    private String crearId(){
        String id= UUID.randomUUID().toString();
        System.out.println("Id creado: "+id);

        return id;
    }

    private String cifrarRotor(M3 maquina, Rotor rotor, String a, boolean vuelta){
        // Calculamos offset (la posición menos la configuración inicial)
        int offset=rotor.posicion-rotor.ring_setting;

        // Convertimos la letra en base a ese offset (Se le suma el offset)
        String nuevo=maquina.alfabeto_letras.get((maquina.alfabeto_letras.indexOf(a)+offset)%26);

        // Aplicamos la traducción del rotor
        // Si estamos en el camino de ida se hace de manera distinta a si estuviéramos en el de vuelta
        if(vuelta) {
            // Si ya se hizo la traducción del reflector, miramos qué letra se traduce en la que tenemos
            for(int i=0;i<26;i++){
                if(rotor.alfabeto[i]==maquina.alfabeto_letras.indexOf(nuevo)){
                    nuevo=maquina.alfabeto_letras.get(i);
                    break;
                }
            }
        }else{
            // Si aún no se hizo la traducción del reflector, miramos a qué letra se traduce la que tenemos
            nuevo = maquina.alfabeto_letras.get(rotor.alfabeto[maquina.alfabeto_letras.indexOf(nuevo)]);
        }

        // Convertimos la letra resultante en base al offset, de nuevo (Se le resta el offset)
        int letra=maquina.alfabeto_letras.indexOf(nuevo)-offset;

        if(letra<0){
            nuevo=maquina.alfabeto_letras.get(26+letra);
        }else{
            nuevo=maquina.alfabeto_letras.get(letra%26);

        }
        // Devolvemos la letra resultante
        return nuevo;
    }

    private String descifrarRotor(M3 maquina, Rotor rotor, String a, boolean vuelta){
        return cifrarRotor(maquina, rotor, a, vuelta);
    }

    public M3DTO ponerCables(String id, CablesDTO cabledto){
        M3DTO maquina=null;

        // Buscamos la máquina
        var m3=m3Repo.findById(id);

        if(m3.isPresent()&&!cabledto.getA().equals(cabledto.getB())){
            maquina=m3.get();

            boolean esta=false;

            // Vamos rotor por rotor de la máquina cambiando sus ajustes
            List<Cable> cables=maquina.getCables();
            for(Cable cable:cables){
                if (cable.getA().equals(cabledto.getA())) {
                    esta = true;
                    break;
                }
            }

            if(!esta){
                cables.add(new Cable(cabledto.getA(), cabledto.getB()));
                cables.add(new Cable(cabledto.getB(), cabledto.getA()));

                maquina.setCables(cables);
                // Actualizamos la máquina en la BD
                m3Repo.save(maquina);
            }
        }
        // Devolvemos el DTO de la máquina editada
        return maquina;
    }

    public M3DTO sacarCables(String id, CablesDTO cabledto){
        M3DTO maquina=null;
        var m3=m3Repo.findById(id);
        if(m3.isPresent()){
            maquina=m3.get();
            Cable cable1=null;
            Cable cable2=null;

            boolean esta=false;
            List<Cable> cables=maquina.getCables();
            for(Cable cable:cables){
                if (cable.getA().equals(cabledto.getA())) {
                    esta = true;
                    cable1=cable;
                }

                else if(cable.getB().equals(cabledto.getA())) {
                    esta = true;
                    cable2=cable;
                }
            }

            if(esta){
                cables.remove(cable1);
                cables.remove(cable2);

                maquina.setCables(cables);
                m3Repo.save(maquina);
            }
        }
        return maquina;
    }

}
