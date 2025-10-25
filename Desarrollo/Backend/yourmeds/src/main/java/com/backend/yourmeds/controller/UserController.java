package com.backend.yourmeds.controller;

import com.backend.yourmeds.dto.user.CreateUserRequestDto;
import com.backend.yourmeds.dto.user.CreateUserResponseDto;
import com.backend.yourmeds.dto.user.LoginRequestDto;
import com.backend.yourmeds.dto.user.LoginResponseDto;
import com.backend.yourmeds.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

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

    // METODO PARA OBTENER TODA LA INFO DE UN USUARIO CON SUS GRUPOS Y ALARMAS
    @GetMapping("/{id}/overview")
    public ResponseEntity<?> overview(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.getOverview(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(
                    java.util.Map.of("message", e.getMessage(), "statusCode", 404)
            );
        }
    }

    @GetMapping("/me/id")
    public ResponseEntity<Object> myId(Authentication authentication) {
        try {
            String email = authentication.getName();
            Long id = userService.getCurrentUserIdByEmail(email);
            return ResponseEntity.ok(id);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage(), "statusCode", 404));
        }
    }


}
