package com.backend.yourmeds.repository;

import com.backend.yourmeds.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoleRepository extends JpaRepository<Role, String> {
    // Metodo que permite encontrar algun rol relacionado al parametro
    boolean existsByName(String name);
    // Busqueda de roles de un usuario
    List<Role> findAllByUsers_User_Id(Long idUser);
}
