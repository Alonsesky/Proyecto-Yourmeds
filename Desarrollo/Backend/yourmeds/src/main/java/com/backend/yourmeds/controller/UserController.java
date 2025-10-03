package com.backend.yourmeds.controller;

import com.backend.yourmeds.dto.user.CreateUserRequestDto;
import com.backend.yourmeds.dto.user.CreateUserResponseDto;
import com.backend.yourmeds.dto.user.LoginRequestDto;
import com.backend.yourmeds.dto.user.LoginResponseDto;
import com.backend.yourmeds.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/v1/user")
public class UserController {

    @Autowired
    private UserService userService;

    // Metodo POST - Crear usuario en el sistema
    @PostMapping
    public ResponseEntity<CreateUserResponseDto> createUser(@RequestBody CreateUserRequestDto createUserRequestDto){
        CreateUserResponseDto user = userService.createUser(createUserRequestDto);
        return  ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id){
        try {
           CreateUserResponseDto createUserResponseDto = userService.findById(id);
           return ResponseEntity.ok(createUserResponseDto);
        } catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message",e.getMessage(),
                    "statusCode", HttpStatus.NOT_FOUND.value()
            ));
        }
    }
}
