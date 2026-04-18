package com.example.enigma.Modelo;

import jakarta.persistence.Embeddable;

@Embeddable
public class Cable {
    private Integer a;
    private Integer b;

    public Cable(Integer a, Integer b) {
        this.a = a;
        this.b = b;
    }

    public Cable() {

    }

    public Integer getA() {
        return a;
    }

    public void setA(Integer a) {
        this.a = a;
    }

    public Integer getB() {
        return b;
    }

    public void setB(Integer b) {
        this.b = b;
    }
}
