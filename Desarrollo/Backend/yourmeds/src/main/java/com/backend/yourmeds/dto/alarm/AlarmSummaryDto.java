package com.backend.yourmeds.dto.alarm;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AlarmSummaryDto {
    private Long id;
    private String name;
    private LocalDate dateStart;
}
