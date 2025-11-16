package com.backend.yourmeds.dto.user;
import lombok.Data;

@Data
public class UserUpdateRequest {

    private String name;

    private String last_name;

    private Integer age;

    private String rut;

    private String email;
}