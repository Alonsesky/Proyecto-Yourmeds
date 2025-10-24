package com.backend.yourmeds.dto.user;

import com.backend.yourmeds.dto.alarm.AlarmSummaryDto;
import com.backend.yourmeds.dto.group.GroupMemberDto;
import lombok.Data;

import java.util.List;

@Data
public class UserGroupDto {
    private Long groupId;
    private String name;
    private boolean isPrivate;
    private boolean isOwner; // si el usuario consultado es owner en ese grupo
    private List<GroupMemberDto> users;
    private List<AlarmSummaryDto> alarms;
}
