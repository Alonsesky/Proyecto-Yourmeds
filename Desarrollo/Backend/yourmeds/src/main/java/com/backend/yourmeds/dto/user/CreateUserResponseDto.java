package com.backend.yourmeds.dto.user;

import com.backend.yourmeds.dto.role.RoleDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class CreateUserResponseDto {

    public Long id;
    public String email;
    public String rut;
    public String name;
    public String lastName;
    public int age;

    @JsonProperty("notification_token")
    public String notificationToken;

    List<RoleDto> roles;


}
