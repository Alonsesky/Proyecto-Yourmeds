package com.backend.yourmeds.dto.user;

import lombok.Data;

@Data
public class LoginResponseDto {

    private String token;
    private CreateUserResponseDto user;

}
