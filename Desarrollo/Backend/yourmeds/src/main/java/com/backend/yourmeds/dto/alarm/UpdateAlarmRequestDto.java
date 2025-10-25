package com.backend.yourmeds.dto.alarm;

import java.time.LocalDate;


public class UpdateAlarmRequestDto {
    public String name;
    public Boolean alarm_type;
    public Boolean active;
    public Integer cant;
    public LocalDate date_start;
    public LocalDate date_end;
    public String description;
    public Long groupId;
}
