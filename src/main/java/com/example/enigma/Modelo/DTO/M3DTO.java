package com.example.enigma.Modelo.DTO;

import com.example.enigma.Modelo.M3;
import com.example.enigma.Modelo.Rotor;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;


import java.util.ArrayList;

@Entity
public class M3DTO {

    @Id
    private String id;

    // Creo que en algún momento del desarrollo voy a necesitar la posición de los rotores, pero, por el momento, me da igual
    private ArrayList<Integer> rotores;
    private ArrayList<String> rotores_settings;
    private ArrayList<ArrayList<Integer>> cables;
    private int reflector;

    public M3DTO(M3 m3){
        if(m3!=null){
            this.id=m3.id;
            rotores=new ArrayList<>();
            rotores_settings=new ArrayList<>();
            cables=new ArrayList<>();

            for(Rotor rotor:m3.rotores){
                rotores.add(rotor.getTipo());
                rotores_settings.add(m3.alfabeto_letras.get(rotor.ring_setting));
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


    public ArrayList<ArrayList<Integer>> getCables() {
        return cables;
    }

    public void setCables(ArrayList<ArrayList<Integer>> cables) {
        this.cables = cables;
    }
}
