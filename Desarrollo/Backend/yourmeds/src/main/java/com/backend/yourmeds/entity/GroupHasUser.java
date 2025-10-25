package com.backend.yourmeds.entity;

import com.backend.yourmeds.entity.id.GroupUserId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "group_user")
public class GroupHasUser {

    @EmbeddedId
    private GroupUserId id;

    @ManyToOne(fetch = FetchType.LAZY) @MapsId("userId")
    @JoinColumn(name = "id_user")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY) @MapsId("groupId")
    @JoinColumn(name = "id_group")
    private Group group;

    @Column(name = "isOwner", nullable = false)
    private boolean isOwner;

    public GroupHasUser() {
    }

    public GroupHasUser(GroupUserId id, Group group, User user) {
        this.id = new GroupUserId(group.getId(),user.getId());
        this.group = group;
        this.user = user;
    }
}
