package com.backend.yourmeds.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.Date;

@Getter
@Setter
@Entity
public class Alarm {

    //Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(length = 50, nullable = false)
    String name;

    @Column(name = "alarm_type")
    boolean alarmType;

    @Column(nullable = false)
    boolean active;

    @Column(nullable = false)
    int cant;

    @Column(nullable = false)
    Date dateStart;

    @Column(nullable = false)
    Date dateEnd;

    String description;

    @Column(nullable = false)
    private ZonedDateTime timestamp;

    // Atributo relación con Group
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "group_id")
    @JsonIgnoreProperties("alarms")
    private Group group;

    // Constructores
    public Alarm() {
    }

    public Alarm(Long id, String name, boolean alarmType, boolean active, int cant, Date dateStart, Date dateEnd, String description, ZonedDateTime timestamp) {
        this.id = id;
        this.name = name;
        this.alarmType = alarmType;
        this.active = active;
        this.cant = cant;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.description = description;
        this.timestamp = timestamp;
    }


}
