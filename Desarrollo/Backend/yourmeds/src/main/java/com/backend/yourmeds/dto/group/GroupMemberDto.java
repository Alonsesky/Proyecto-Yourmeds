package com.backend.yourmeds.dto.group;

import lombok.Data;

@Data
public class GroupMemberDto {

    private Long id;
    private String name;
    private boolean isOwner;

}
