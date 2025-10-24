package com.backend.yourmeds.dto.alarm;

import com.backend.yourmeds.dto.user.UserGroupDto;
import lombok.Data;

import java.util.List;

@Data
public class UserOverviewDto {
    private Long userId;
    private String name;
    private List<UserGroupDto> groups;
}
