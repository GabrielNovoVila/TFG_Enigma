package com.example.enigma.Modelo.DTO;

public class CifrarDTO {
    private String letra;
    private String pasos;
    private M3DTO maquina;

    public CifrarDTO(String letra, M3DTO maquina){
        this.letra=letra;
        this.maquina=maquina;

        pasos="Aquí irían los pasos que se siguieron";
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

    public String getPasos() {
        return pasos;
    }

    public void setPasos(String pasos) {
        this.pasos = pasos;
    }
}
