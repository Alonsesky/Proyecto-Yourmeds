package com.backend.yourmeds.dto.alarm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.Date;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class AlarmResponseDto {
    private Long id;
    private String name;
    private boolean alarm_type;
    private boolean active;
    private Integer cant;
    private LocalDate date_start;
    private LocalDate date_end;
    private String description;
    private ZonedDateTime timestamp;
    private Long group_id;
}
