package com.backend.yourmeds.entity.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;
import java.util.Objects;

@Data
@Embeddable
public class GroupUserId implements Serializable {

    @Column(name = "id_group")
    private Long groupId;

    @Column(name = "id_user")
    private Long userId;

    @Override
    public boolean equals(Object object){
        if (this == object) return true;
        if (!(object instanceof UserRoleId)) return  false;
        GroupUserId groupUserId = (GroupUserId) object;
        return Objects.equals(groupId,groupUserId.groupId) && Objects.equals(userId, groupUserId.userId);
    }

    @Override
    public int hashCode(){
        return  Objects.hash(groupId,userId);
    }

    public GroupUserId() {
    }

    public GroupUserId(Long groupId, Long userId) {
        this.groupId = groupId;
        this.userId = userId;
    }

}
