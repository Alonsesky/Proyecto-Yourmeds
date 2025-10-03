package com.backend.yourmeds.controller;

import com.backend.yourmeds.dto.user.CreateUserRequestDto;
import com.backend.yourmeds.dto.user.CreateUserResponseDto;
import com.backend.yourmeds.dto.user.LoginRequestDto;
import com.backend.yourmeds.dto.user.LoginResponseDto;
import com.backend.yourmeds.entity.User;
import com.backend.yourmeds.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("api/v1/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    // Metodo POST - Crear usuario en el sistema
    @PostMapping("/register")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequestDto createUserRequestDto){
        try {
        CreateUserResponseDto user = userService.createUser(createUserRequestDto);
        return  ResponseEntity.status(HttpStatus.CREATED ).body(user);
        } catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message",e.getMessage(),
                    "statusCode", HttpStatus.BAD_REQUEST.value()

            ));
        }
    }

    // Metodo POST - Loguear usuario en el sistema
    @PostMapping("/login")
    public ResponseEntity<?> createUser(@RequestBody LoginRequestDto loginRequestDto){
        try {
            LoginResponseDto loginResponseDto = userService.LoginUser(loginRequestDto);
            return  ResponseEntity.ok(loginResponseDto);
        } catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message",e.getMessage(),
                    "statusCode", HttpStatus.UNAUTHORIZED.value()
            ));
        }
    }
}
