package com.backend.yourmeds.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String last_name;
    private Integer age;
    private String rut;
    private String email;
}