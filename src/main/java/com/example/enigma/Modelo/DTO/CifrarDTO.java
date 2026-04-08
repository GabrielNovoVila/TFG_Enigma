package com.example.enigma.Modelo.DTO;

import com.example.enigma.Modelo.M3;

public class CifrarDTO {
    private String letra;
    private M3 maquina;

    public CifrarDTO(String letra, M3 maquina){
        this.letra=letra;
        this.maquina=maquina;
    }

    public String getLetra() {
        return letra;
    }

    public void setLetra(String letra) {
        this.letra = letra;
    }

    public M3 getMaquina() {
        return maquina;
    }

    public void setMaquina(M3 maquina) {
        this.maquina = maquina;
    }
}
