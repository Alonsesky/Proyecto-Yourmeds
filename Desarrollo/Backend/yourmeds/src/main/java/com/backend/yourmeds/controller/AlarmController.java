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
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.NOT_FOUND.value()
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(alarmService.getById(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.NOT_FOUND.value()
            ));
        }
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) Long groupId) {
        try {
            List<AlarmResponseDto> data = (groupId == null)
                    ? alarmService.listAll()
                    : alarmService.listByGroup(groupId);
            return ResponseEntity.ok(data);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.NOT_FOUND.value()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UpdateAlarmRequestDto body) {
        try {
            return ResponseEntity.ok(alarmService.update(id, body));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.NOT_FOUND.value()
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
        }
    }
}