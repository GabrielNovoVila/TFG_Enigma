package com.example.enigma.Modelo.DTO;

import java.util.ArrayList;

public class CifrarDTO {
    private String letra;
    private ArrayList<String> pasos;
    private M3DTO maquina;

    public CifrarDTO(String letra, M3DTO maquina, ArrayList<String> pasos){
        this.letra=letra;
        this.maquina=maquina;

        this.pasos=pasos;
    }

    public String getLetra() {
        return letra;
    }

    public void setLetra(String letra) {
        this.letra = letra;
    }

    public M3DTO getMaquina() {
        return maquina;
    }

    public void setMaquina(M3DTO maquina) {
        this.maquina = maquina;
    }

    public ArrayList<String> getPasos() {
        return pasos;
    }

    public void setPasos(ArrayList<String> pasos) {
        this.pasos = pasos;
    }
}
