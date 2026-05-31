package com.example.enigma.Modelo.DTO;

import java.util.ArrayList;

public class ConfigDTO {
    private ArrayList<Integer> rotores;
    private ArrayList<String> ring_settings;
    private ArrayList<Integer> rotor_positions;

    public ConfigDTO(){

    }

    public ArrayList<Integer> getRotores() {
        return rotores;
    }

    public void setRotores(ArrayList<Integer> rotores) {
        this.rotores = rotores;
    }

    public ArrayList<String> getRing_settings() {
        return ring_settings;
    }

    public void setRing_settings(ArrayList<String> ring_settings) {
        this.ring_settings = ring_settings;
    }

    public ArrayList<Integer> getRotor_positions() {
        return rotor_positions;
    }

    public void setRotor_positions(ArrayList<Integer> rotor_positions) {
        this.rotor_positions = rotor_positions;
    }
}
