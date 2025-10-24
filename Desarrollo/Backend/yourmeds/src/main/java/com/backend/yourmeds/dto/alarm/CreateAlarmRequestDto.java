package com.backend.yourmeds.dto.alarm;

import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDateTime;
import java.util.Date;

public class CreateAlarmRequestDto {

    public String name;

    // opcional si no lo ocupas
    public Boolean alarmType;

    public Boolean active;

    public Integer cant;

    public Date dateStart;
    public Date dateEnd;

    public String description;

    //@NotNull
    public Long groupId;
}
