package com.backend.yourmeds.dto.alarm;

import java.util.Date;

public class UpdateAlarmRequestDto {
    public String name;
    public Boolean alarmType;
    public Boolean active;
    public Integer cant;
    public Date dateStart;
    public Date dateEnd;
    public String description;
    public Long groupId; // permitir mover la alarma a otro grupo
}
