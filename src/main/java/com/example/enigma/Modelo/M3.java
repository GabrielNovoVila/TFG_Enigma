package com.example.enigma.Modelo;

import org.springframework.data.annotation.Id;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class M3 {

    // ATRIBUTOS

    @Id
    public String id;

    public ArrayList<String> alfabeto_letras=new ArrayList<>(Arrays.asList("A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"));
    public HashMap<String,String> cables;
    public ArrayList<Rotor> rotores;
    public Reflector reflector;

    // CONSTRUCTOR

    public M3(String id){
        this.id=id;
        rotores = new ArrayList<>();
        cables=new HashMap<>();
        reflector=new Reflector(0);

        for (int i = 0; i < 3; i++){
            rotores.add(new Rotor(i));
        }
    }

    // GETTERS Y SETTERS
    // ...

    // MÉTODOS

    public void anadirCables(String c, String d){
        cables.put(c, d);
        cables.put(d, c);
    }

    public void eliminarCables(String c, String d){
        cables.remove(c, d);
        cables.remove(d, c);
    }
}
