package com.backend.yourmeds.controller;

import com.backend.yourmeds.dto.group.AddMembersRequestDto;
import com.backend.yourmeds.dto.group.CreateGroupRequestDto;
import com.backend.yourmeds.dto.group.GroupResponseDto;
import com.backend.yourmeds.dto.group.UpdateGroupRequestDto;
import com.backend.yourmeds.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("api/v1/group")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateGroupRequestDto request){
        try {
            GroupResponseDto response = groupService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.BAD_REQUEST.value()
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id){
        try {
            GroupResponseDto response = groupService.findById(id);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.NOT_FOUND.value()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UpdateGroupRequestDto request){
        try {
            GroupResponseDto response = groupService.update(id, request);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.NOT_FOUND.value()
            ));
        } catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.BAD_REQUEST.value()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        try {
            groupService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", e.getMessage(),
                    "statusCode", HttpStatus.NOT_FOUND.value()
            ));
        }
    }

    // ENDPOINTS PARA LOS MIEMBROS DE UN GRUPO
    @GetMapping("/{id}/members")
    public ResponseEntity<?> listMembers(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(groupService.listMembers(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(
                    java.util.Map.of("message", e.getMessage(), "statusCode", 404)
            );
        }
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMembers(@PathVariable Long id, @RequestBody AddMembersRequestDto body) {
        try {
            return ResponseEntity.ok(groupService.addMembersByEmail(id, body));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(
                    java.util.Map.of("message", e.getMessage(), "statusCode", 409)
            );
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(
                    java.util.Map.of("message", e.getMessage(), "statusCode", 404)
            );
        }
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        try {
            groupService.removeMember(id, userId);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(
                    java.util.Map.of("message", e.getMessage(), "statusCode", 404)
            );
        }
    }

    @PutMapping("/{id}/members/{userId}/owner")
    public ResponseEntity<?> setOwner(@PathVariable Long id, @PathVariable Long userId,
                                      @RequestParam boolean isOwner) {
        try {
            return ResponseEntity.ok(groupService.setOwnerFlag(id, userId, isOwner));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(
                    java.util.Map.of("message", e.getMessage(), "statusCode", 404)
            );
        }
    }
}

