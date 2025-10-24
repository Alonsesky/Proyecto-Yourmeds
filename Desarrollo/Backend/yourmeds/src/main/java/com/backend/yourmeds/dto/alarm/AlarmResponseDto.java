package com.backend.yourmeds.dto.alarm;

import lombok.Data;

import java.time.ZonedDateTime;
import java.util.Date;

@Data
public class AlarmResponseDto {
    private Long id;
    private String name;
    private boolean alarmType;
    private boolean active;
    private Integer cant;
    private Date dateStart;
    private Date dateEnd;
    private String description;
    private ZonedDateTime timestamp;
    private Long groupId;
}
