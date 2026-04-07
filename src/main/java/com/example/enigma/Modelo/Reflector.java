package com.example.enigma.Modelo;

public class Reflector {

    //ATRIBUTOS

    private int tipo;
    public int[] alfabeto;

    //CONSTRUCTORES

    public Reflector(int tipo) {
        this.tipo = tipo;

        switch (tipo) {
            case 0:
                alfabeto = new int[]{24, 17, 20, 7, 16, 18, 11, 3, 15, 23, 13, 6, 14, 10, 12, 8, 4, 1, 5, 25, 2, 22, 21, 9, 0, 19};
                break;
            case 1:
                alfabeto = new int[]{5, 21, 15, 9, 8, 0, 14, 24, 4, 3, 17, 25, 23, 22, 6, 2, 19, 10, 20, 16, 18, 1, 13, 12, 7, 11};
                break;
            default:
                break;
        }
    }

    //GETTERS Y SETTERS

    public int getTipo() {
        return tipo;
    }

    public void setTipo(int tipo) {
        this.tipo = tipo;

        switch (tipo) {
            case 0:
                alfabeto = new int[]{24, 17, 20, 7, 16, 18, 11, 3, 15, 23, 13, 6, 14, 10, 12, 8, 4, 1, 5, 25, 2, 22, 21, 9, 0, 19};
                break;
            case 1:
                alfabeto = new int[]{5, 21, 15, 9, 8, 0, 14, 24, 4, 3, 17, 25, 23, 22, 6, 2, 19, 10, 20, 16, 18, 1, 13, 12, 7, 11};
                break;
            default:
                break;
        }
    }

    //MÉTODOS
    //...
}
