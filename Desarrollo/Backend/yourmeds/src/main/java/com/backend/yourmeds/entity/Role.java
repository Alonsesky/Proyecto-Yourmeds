package com.backend.yourmeds.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Entity
public class Role {

    // Atributos de la clase role
    @Id
    private String id = UUID.randomUUID().toString();

    @Column(length = 36, unique = true, nullable = false)
    private String name;

    @Column(length = 255, nullable = false)
    private String route;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Atributo relacion
    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserHasRoles> users = new HashSet<>();

    // Constructor
    public Role() {
    }

    //Metodo para actualizar la fecha al momento de realizar alguna actualización
    @PreUpdate
    public void onUpdadte(){
        this.updatedAt = LocalDateTime.now();
    }
}
