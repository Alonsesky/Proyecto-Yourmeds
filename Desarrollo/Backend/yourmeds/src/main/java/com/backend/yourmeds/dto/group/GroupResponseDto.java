package com.backend.yourmeds.dto.group;

import com.backend.yourmeds.entity.Group;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class GroupResponseDto {
    private Long id;
    private String name;
    private Integer cant_users;
    private Boolean is_private;
    private LocalDateTime create_at;
    private LocalDateTime updated_at;
    private Boolean isOwner;
    private String color;

    public static GroupResponseDto from(Group g, boolean isOwner) {
        return GroupResponseDto.builder()
                .id(g.getId())
                .name(g.getName())
                .cant_users(g.getCantUsers())
                .is_private(g.isPrivate())
                .create_at(g.getCreatedAt())
                .updated_at(g.getUpdatedAt())
                .isOwner(isOwner)
                .color(g.getColor())
                .build();
    }
}