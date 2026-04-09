package com.example.enigma.Repositorio;

import com.example.enigma.Modelo.M3;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@NullMarked
@Repository
public interface M3Repo extends MongoRepository<M3, String> {
}
