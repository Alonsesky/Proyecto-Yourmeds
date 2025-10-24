package com.backend.yourmeds.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
public class User implements UserDetails {

    // Atributos de la clase User
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String rut;

    @Column(length = 55, nullable = false)
    private String name;

    @Column(length = 55, nullable = false)
    private String lastName;

    @Column(length = 3, nullable = false)
    private int age;

    @Column(length =255,  nullable = false)
    private String password;

    @Column(name = "notification_token", length =255,  nullable = true)
    private String notificationToken;

    // Atributos para registrar el tiempo actual
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Atributos de relacion
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserHasRoles> roles = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<GroupHasUser> groups = new HashSet<>();

    // Constructor
    public User() {
    }

    //Metodo para actualizar la fecha al momento de realizar alguna actualización
    @PreUpdate
    public void onUpdadte(){
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getUsername() {
        return this.email;
    }
}
