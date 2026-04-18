package com.example.enigma.Modelo.DTO;

import com.example.enigma.Modelo.Cable;
import com.example.enigma.Modelo.M3;
import com.example.enigma.Modelo.Rotor;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
public class M3DTO {

    @Id
    private String id;

    // Creo que en algún momento del desarrollo voy a necesitar la posición de los rotores, pero, por el momento, me da igual
    @ElementCollection
    private List<Integer> rotores;
    @ElementCollection
    private List<String> rotores_settings;
    @ElementCollection
    private List<Integer> rotores_posiciones;
    @ElementCollection
    private List<Cable> cables;
    private int reflector;

    public M3DTO(M3 m3){
        if(m3!=null){
            this.id=m3.id;
            rotores=new ArrayList<>();
            rotores_settings=new ArrayList<>();
            rotores_posiciones=new ArrayList<>();
            cables=new ArrayList<>();

            for(Rotor rotor:m3.rotores){
                rotores.add(rotor.getTipo());
                rotores_settings.add(m3.alfabeto_letras.get(rotor.ring_setting));
                rotores_posiciones.add(rotor.posicion);
            }

            for (Map.Entry<String, String> entry : m3.cables.entrySet()) {
                String clave = entry.getKey();
                String valor=entry.getValue();

                cables.add(new Cable(m3.alfabeto_letras.indexOf(clave), m3.alfabeto_letras.indexOf(valor)));
            }
        }
    }

    public M3DTO(){}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<Integer> getRotores() {
        return rotores;
    }

    public void setRotores(ArrayList<Integer> rotores) {
        this.rotores = rotores;
    }

    public List<Integer> getRotores_posiciones() {
        return rotores_posiciones;
    }

    public void setRotores_posiciones(List<Integer> rotores_posiciones) {
        this.rotores_posiciones = rotores_posiciones;
    }

    public List<String> getRotores_settings() {
        return rotores_settings;
    }

    public void setRotores_settings(ArrayList<String> rotores_settings) {
        this.rotores_settings = rotores_settings;
    }

    public int getReflector() {
        return reflector;
    }

    public void setReflector(int reflector) {
        this.reflector = reflector;
    }

    public List<Cable> getCables() {
        return cables;
    }

    public void setCables(List<Cable> cables) {
        this.cables = cables;
    }
}
