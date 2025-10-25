package com.backend.yourmeds.controller;

import com.backend.yourmeds.dto.alarm.AlarmResponseDto;
import com.backend.yourmeds.dto.alarm.CreateAlarmRequestDto;
import com.backend.yourmeds.dto.alarm.UpdateAlarmRequestDto;
import com.backend.yourmeds.service.AlarmService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/alarm")
public class AlarmController {

    @Autowired
    private AlarmService alarmService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateAlarmRequestDto body) {
        try {
            AlarmResponseDto dto = alarmService.create(body);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (NoSuchElementException e) { // grupo o usuario no encontrado
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.NOT_FOUND.value()
            ));
        } catch (IllegalStateException e) { // no es miembro del grupo u otra regla de negocio
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.BAD_REQUEST.value()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Unexpected error: " + e.getMessage(),
                    "statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value()
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        try {
            AlarmResponseDto dto = alarmService.get(id);
            return ResponseEntity.ok(dto);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.NOT_FOUND.value()
            ));
        } catch (IllegalStateException e) { // no pertenece al grupo de la alarma
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.BAD_REQUEST.value()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Unexpected error: " + e.getMessage(),
                    "statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UpdateAlarmRequestDto body) {
        try {
            AlarmResponseDto dto = alarmService.update(id, body);
            return ResponseEntity.ok(dto);
        } catch (NoSuchElementException e) { // alarma o usuario/grupo no encontrado
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.NOT_FOUND.value()
            ));
        } catch (IllegalStateException e) { // no es miembro, etc.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.BAD_REQUEST.value()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Unexpected error: " + e.getMessage(),
                    "statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            alarmService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.NOT_FOUND.value()
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.BAD_REQUEST.value()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Unexpected error: " + e.getMessage(),
                    "statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value()
            ));
        }
    }

    // Listar alarmas por grupo
    @GetMapping("/by-group/{groupId}")
    public ResponseEntity<?> listByGroup(@PathVariable Long groupId) {
        try {
            List<AlarmResponseDto> list = alarmService.listByGroup(groupId);
            return ResponseEntity.ok(list);
        } catch (NoSuchElementException e) { // grupo no encontrado
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.NOT_FOUND.value()
            ));
        } catch (IllegalStateException e) { // no pertenece al grupo
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.BAD_REQUEST.value()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Unexpected error: " + e.getMessage(),
                    "statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value()
            ));
        }
    }
}