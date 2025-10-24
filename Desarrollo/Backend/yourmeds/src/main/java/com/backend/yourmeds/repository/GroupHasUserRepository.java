package com.backend.yourmeds.repository;

import com.backend.yourmeds.entity.GroupHasUser;
import com.backend.yourmeds.entity.id.GroupUserId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupHasUserRepository extends JpaRepository<GroupHasUser, GroupUserId> {

    List<GroupHasUser> findByUser_Id(Long userId);
    List<GroupHasUser> findByGroup_Id(Long groupId);
    Optional<GroupHasUser> findById_GroupIdAndId_UserId(Long groupId, Long userId);
    boolean existsById_GroupIdAndId_UserId(Long groupId, Long userId);
}
