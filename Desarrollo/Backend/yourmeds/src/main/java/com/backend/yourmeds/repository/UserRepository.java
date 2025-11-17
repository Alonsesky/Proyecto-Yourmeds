package com.backend.yourmeds.repository;


import com.backend.yourmeds.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    boolean existsByRut(String rut);

    Optional<User> findByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByRutAndIdNot(String rut, Long id);

}
