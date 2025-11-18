package com.backend.yourmeds.dto.alarm;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AlarmSummaryDto {
    private Long id;
    private String name;
    private boolean alarm_type;
    private boolean active;
    private Integer cant;
    private Integer interval_hours;
    private LocalTime time_alarm;
    private LocalDate date_start;
    private LocalDate date_end;
    private String description;
}
