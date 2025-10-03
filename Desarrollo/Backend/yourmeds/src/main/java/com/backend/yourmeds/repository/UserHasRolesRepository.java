package com.backend.yourmeds.repository;

import com.backend.yourmeds.entity.UserHasRoles;
import com.backend.yourmeds.entity.id.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserHasRolesRepository extends JpaRepository<UserHasRoles, UserRoleId> {

}
