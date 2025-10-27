package com.backend.yourmeds.dto.alarm;

import java.time.LocalDate;
import java.time.LocalTime;


public class UpdateAlarmRequestDto {
    public String name;
    public Boolean alarm_type;
    public Boolean active;
    public Integer cant;
    public LocalTime time_alarm;
    public LocalDate date_start;
    public LocalDate date_end;
    public String description;
    public Long groupId;
}
