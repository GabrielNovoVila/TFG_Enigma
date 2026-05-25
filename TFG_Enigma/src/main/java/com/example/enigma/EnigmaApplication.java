package com.example.enigma;

import com.example.enigma.Modelo.M3;
import com.example.enigma.Utils.MongoConnection;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;


import java.util.Scanner;

@SpringBootApplication
public class EnigmaApplication {

    private static ConfigurableApplicationContext springContext;

    public static void main(String[] args) {
        init();
    }

    public static void init(){

        //MongoConnection db= new MongoConnection();
        springContext = new SpringApplicationBuilder(EnigmaApplication.class).run();
    }

}
