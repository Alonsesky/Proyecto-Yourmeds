package com.backend.yourmeds.entity.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;
import java.util.Objects;

@Data
@Embeddable
public class UserRoleId implements Serializable {

    @Column(name = "id_user")
    private Long userId;

    @Column(name = "id_role")
    private String roleId;

    @Override
    public boolean equals(Object object){
        if (this == object) return true;
        if (!(object instanceof UserRoleId)) return  false;
        UserRoleId userRoleId = (UserRoleId) object;
        return Objects.equals(userId,userRoleId.userId) && Objects.equals(roleId, userRoleId.roleId);
    }

    @Override
    public int hashCode(){
        return  Objects.hash(userId, roleId);
    }

    public UserRoleId() {
    }

    public UserRoleId(Long userId, String roleId) {
        this.userId = userId;
        this.roleId = roleId;
    }
}
