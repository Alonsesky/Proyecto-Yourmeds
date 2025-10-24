package com.backend.yourmeds.dto.user;

import lombok.Data;

@Data
public class LoginRequestDto {

    private String email;
    private String password;

}
