package com.backend.yourmeds.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "`group`")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String name;

    @Column(name = "cant_users")
    int cantUsers;

    String description;

    @Column(name = "is_private")
    private boolean isPrivate;

    // Atributos para registrar el tiempo actual
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Atributo relacion con User
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<GroupHasUser> users = new HashSet<>();

    //Atributo relacion con Alarm
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Alarm> alarms = new HashSet<>();

    public Group() {
    }

    //Metodo para actualizar la fecha al momento de realizar alguna actualización
    @PreUpdate
    public void onUpdadte(){
        this.updatedAt = LocalDateTime.now();
    }
}
