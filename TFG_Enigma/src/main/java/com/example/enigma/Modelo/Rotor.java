package com.example.enigma.Modelo;

public class Rotor {

    // ATRIBUTOS
    public int[] alfabeto;
    private int tipo;
    public int letra_cambio;
    
    public int ring_setting;
    public int posicion;

    // CONSTRUCTORES

    public Rotor(int tipo) {
        this.tipo = tipo;
        ring_setting=0;
        posicion=0;

        switch(tipo){
            case 0:
                letra_cambio = 17;
                alfabeto = new int[]{4, 10, 12, 5, 11, 6, 3, 16, 21, 25, 13, 19, 14, 22, 24, 7, 23, 20, 18, 15, 0, 8, 1, 17, 2, 9};

                break;
            case 1:
                letra_cambio = 5;
                alfabeto=new int[]{0, 9, 3, 10, 18, 8, 17, 20, 23, 1, 11, 7, 22, 19, 12, 2, 16, 6, 25, 13, 15, 24, 5, 21, 14, 4};

                break;
            case 2:
                letra_cambio = 22;
                alfabeto=new int[]{1, 3, 5, 7, 9, 11, 2, 15, 17, 19, 23, 21, 25, 13, 24, 4, 8, 22, 6, 0, 10, 12, 20, 18, 16, 14};

                break;
            case 3:
                letra_cambio = 10;
                alfabeto=new int[]{4, 18, 14, 21, 15, 25, 9, 0, 24, 16, 20, 8, 17, 7, 23, 11, 13, 5, 19, 6, 10, 3, 2, 12, 22, 1};
                break;
            case 4:
                letra_cambio = 0;
                alfabeto=new int[]{21, 25, 1, 17, 6, 8, 19, 24, 20, 15, 18, 3, 13, 7, 11, 23, 0, 22, 12, 9, 16, 14, 5, 4, 2, 10};
                break;
            default:
                letra_cambio = -1;
        }
    }

    public Rotor(int tipo, int ring_setting) {
        this.tipo = tipo;
        this.ring_setting = ring_setting;
        posicion=0;

        switch(tipo){
            case 0:
                letra_cambio = 17;
                alfabeto = new int[]{4, 10, 12, 5, 11, 6, 3, 16, 21, 25, 13, 19, 14, 22, 24, 7, 23, 20, 18, 15, 0, 8, 1, 17, 2, 9};
                break;
            case 1:
                letra_cambio = 5;
                alfabeto=new int[]{0, 9, 3, 10, 18, 8, 17, 20, 23, 1, 11, 7, 22, 19, 12, 2, 16, 6, 25, 13, 15, 24, 5, 21, 14, 4};
                break;
            case 2:
                letra_cambio = 22;
                alfabeto=new int[]{1, 3, 5, 7, 9, 11, 2, 15, 17, 19, 23, 21, 25, 13, 24, 4, 8, 22, 6, 0, 10, 12, 20, 18, 16, 14};
                break;
            case 3:
                letra_cambio = 10;
                alfabeto=new int[]{4, 18, 14, 21, 15, 25, 9, 0, 24, 16, 20, 8, 17, 7, 23, 11, 13, 5, 19, 6, 10, 3, 2, 12, 22, 1};
                break;
            case 4:
                letra_cambio = 0;
                alfabeto=new int[]{21, 25, 1, 17, 6, 8, 19, 24, 20, 15, 18, 3, 13, 7, 11, 23, 0, 22, 12, 9, 16, 14, 5, 4, 2, 10};
                break;
            default:
                letra_cambio = -1;
        }
    }

    public Rotor(int tipo, int ring_setting, int posicion) {
        this.tipo = tipo;
        this.ring_setting = ring_setting;
        this.posicion=posicion;

        switch(tipo){
            case 0:
                letra_cambio = 17;
                alfabeto = new int[]{4, 10, 12, 5, 11, 6, 3, 16, 21, 25, 13, 19, 14, 22, 24, 7, 23, 20, 18, 15, 0, 8, 1, 17, 2, 9};
                break;
            case 1:
                letra_cambio = 5;
                alfabeto=new int[]{0, 9, 3, 10, 18, 8, 17, 20, 23, 1, 11, 7, 22, 19, 12, 2, 16, 6, 25, 13, 15, 24, 5, 21, 14, 4};
                break;
            case 2:
                letra_cambio = 22;
                alfabeto=new int[]{1, 3, 5, 7, 9, 11, 2, 15, 17, 19, 23, 21, 25, 13, 24, 4, 8, 22, 6, 0, 10, 12, 20, 18, 16, 14};
                break;
            case 3:
                letra_cambio = 10;
                alfabeto=new int[]{4, 18, 14, 21, 15, 25, 9, 0, 24, 16, 20, 8, 17, 7, 23, 11, 13, 5, 19, 6, 10, 3, 2, 12, 22, 1};
                break;
            case 4:
                letra_cambio = 0;
                alfabeto=new int[]{21, 25, 1, 17, 6, 8, 19, 24, 20, 15, 18, 3, 13, 7, 11, 23, 0, 22, 12, 9, 16, 14, 5, 4, 2, 10};
                break;
            default:
                letra_cambio = -1;
        }
    }

    // GETTERS Y SETTERS

    public int getTipo() {
        return tipo;
    }

    public void setTipo(int tipo) {
        this.tipo = tipo;

        switch(tipo){
            case 0:
                letra_cambio = 17;
                alfabeto = new int[]{4, 10, 12, 5, 11, 6, 3, 16, 21, 25, 13, 19, 14, 22, 24, 7, 23, 20, 18, 15, 0, 8, 1, 17, 2, 9};
                break;
            case 1:
                letra_cambio = 5;
                alfabeto=new int[]{0, 9, 3, 10, 18, 8, 17, 20, 23, 1, 11, 7, 22, 19, 12, 2, 16, 6, 25, 13, 15, 24, 5, 21, 14, 4};
                break;
            case 2:
                letra_cambio = 22;
                alfabeto=new int[]{1, 3, 5, 7, 9, 11, 2, 15, 17, 19, 23, 21, 25, 13, 24, 4, 8, 22, 6, 0, 10, 12, 20, 18, 16, 14};
                break;
            case 3:
                letra_cambio = 10;
                alfabeto=new int[]{4, 18, 14, 21, 15, 25, 9, 0, 24, 16, 20, 8, 17, 7, 23, 11, 13, 5, 19, 6, 10, 3, 2, 12, 22, 1};
                break;
            case 4:
                letra_cambio = 0;
                alfabeto=new int[]{21, 25, 1, 17, 6, 8, 19, 24, 20, 15, 18, 3, 13, 7, 11, 23, 0, 22, 12, 9, 16, 14, 5, 4, 2, 10};
                break;
            default:
                letra_cambio = -1;
        }
    }

    // MÉTODOS

    public void sumarPosicion(){
        posicion=Math.floorMod(posicion+1, 26);
    }
}
