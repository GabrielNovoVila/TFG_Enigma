package com.example.enigma.Repositorio;

import com.example.enigma.Modelo.DTO.M3DTO;
import com.example.enigma.Modelo.M3;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface M3Repo extends CrudRepository<M3DTO, String> {
}
