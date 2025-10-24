package com.backend.yourmeds.dto.alarm;

import lombok.Data;

import java.util.Date;

@Data
public class AlarmSummaryDto {
    private Long id;
    private String name;
    private Date dateStart;
}
