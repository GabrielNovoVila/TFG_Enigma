package com.example.enigma.Modelo.DTO;

import com.example.enigma.Modelo.M3;
import com.example.enigma.Modelo.Rotor;
import org.springframework.data.annotation.Id;

import java.util.ArrayList;

public class M3DTO {

    @Id
    private String id;

    private ArrayList<Integer> rotores=new ArrayList<>();
    private ArrayList<String> rotores_settings;
    private int reflector;

    public M3DTO(M3 m3){
        if(m3!=null){
            this.id=m3.id;

            for(Rotor rotor:m3.rotores){
                rotores.add(rotor.getTipo());
                rotores_settings.add(m3.alfabeto_letras.get(rotor.ring_setting));
            }
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ArrayList<Integer> getRotores() {
        return rotores;
    }

    public void setRotores(ArrayList<Integer> rotores) {
        this.rotores = rotores;
    }

    public ArrayList<String> getRotores_settings() {
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
}
