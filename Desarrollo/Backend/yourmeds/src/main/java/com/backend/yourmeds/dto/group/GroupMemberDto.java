package com.backend.yourmeds.dto.group;

import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * Representa un miembro del grupo en listados de miembros.
 */
@Data
@NoArgsConstructor
public class GroupMemberDto {
    private Long id;
    private String name;
    private Boolean isOwner;

    // Para compatibilidad con tu servicio que usa setOwner(...)
    public void setOwner(Boolean owner) {
        this.isOwner = owner;
    }
}
