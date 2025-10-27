package com.backend.yourmeds.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;

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

    int cant;

    @Column(name = "time_alarm", nullable = false)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime timeAlarm;

    @Column(name = "date_start", nullable = false)
    LocalDate dateStart;

    @Column(name = "date_end", nullable = false)
    LocalDate dateEnd;

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

    public Alarm(Long id, String name, boolean alarmType, boolean active, int cant, LocalTime timeAlarm, LocalDate dateStart, LocalDate dateEnd, String description, ZonedDateTime timestamp, Group group) {
        this.id = id;
        this.name = name;
        this.alarmType = alarmType;
        this.active = active;
        this.cant = cant;
        this.timeAlarm = timeAlarm;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.description = description;
        this.timestamp = timestamp;
        this.group = group;
    }
}
