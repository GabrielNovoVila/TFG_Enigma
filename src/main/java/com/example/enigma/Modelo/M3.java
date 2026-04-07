package com.example.enigma.Modelo;

import org.springframework.data.annotation.Id;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class M3 {

    @Id
    public String id;
    public int[] alfabeto = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25};
    public ArrayList<Character> alfabeto1=new ArrayList<>(Arrays.asList('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'));
    public HashMap<Character,Character> cables;
    public ArrayList<Rotor> rotores;
    public Reflector reflector;

    public M3(String id){
        this.id=id;
        rotores = new ArrayList<>();
        cables=new HashMap<>();
        reflector=new Reflector(0);

        for (int i = 1; i < 4; i++){
            rotores.add(new Rotor(i));
        }
    }

    public void anadirCables(Character c, Character d){
        cables.put(c, d);
        cables.put(d, c);
    }
}
