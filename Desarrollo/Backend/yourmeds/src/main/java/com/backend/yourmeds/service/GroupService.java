package com.backend.yourmeds.service;

import com.backend.yourmeds.dto.group.*;
import com.backend.yourmeds.entity.Group;
import com.backend.yourmeds.entity.GroupHasUser;
import com.backend.yourmeds.entity.User;
import com.backend.yourmeds.entity.id.GroupUserId;
import com.backend.yourmeds.repository.GroupHasUserRepository;
import com.backend.yourmeds.repository.GroupRepository;
import com.backend.yourmeds.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GroupHasUserRepository groupHasUserRepository;

    private GroupResponseDto toResponse(Group entity, boolean isOwner) {
        GroupResponseDto dto = new GroupResponseDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCant_users(entity.getCantUsers());
        dto.setColor(entity.getColor());
        dto.setIs_private(entity.isPrivate());
        dto.setCreate_at(entity.getCreatedAt());
        dto.setUpdated_at(entity.getUpdatedAt());
        dto.setIsOwner(isOwner);
        return dto;
    }

    @Transactional
    public GroupResponseDto create(CreateGroupRequestDto req) {
        // 1) Usuario actual (dueño)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        // 2) Crear y guardar el grupo
        Group g = new Group();
        g.setName(req.name);
        g.setPrivate(req.is_private);
        g.setColor(req.color);
        g.setCreatedAt(LocalDateTime.now());
        Group saved = groupRepository.save(g);

        // 3) Crear el vínculo en la tabla intermedia como propietario
        GroupUserId id = new GroupUserId(saved.getId(), owner.getId()); // (groupId, userId)
        GroupHasUser link = new GroupHasUser();
        link.setId(id);
        link.setUser(owner);
        link.setGroup(saved);
        link.setOwner(true);

        groupHasUserRepository.save(link);

        // 4) Devolver respuesta
        return toResponse(saved, true);
    }

    public GroupResponseDto findById(Long id){
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id: " + id));

        // calcular isOwner para el usuario autenticado
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"))
                .getId();

        boolean isOwner = groupHasUserRepository
                .findById(new GroupUserId(id, userId))
                .map(GroupHasUser::isOwner)
                .orElse(false);

        return toResponse(group, isOwner);
    }

    public GroupResponseDto update(Long id, UpdateGroupRequestDto request){
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id: " + id));

        if (request.name != null) group.setName(request.name);
        if (request.cant_users != null) group.setCantUsers(request.cant_users);
        if (request.is_private != null) group.setPrivate(request.is_private);

        group.setUpdatedAt(LocalDateTime.now());
        Group saved = groupRepository.save(group);

        // calcular isOwner del actual para la respuesta
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"))
                .getId();

        boolean isOwner = groupHasUserRepository
                .findById(new GroupUserId(id, userId))
                .map(GroupHasUser::isOwner)
                .orElse(false);

        return toResponse(saved, isOwner);
    }

    public void delete(Long id){
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id: " + id));
        groupRepository.delete(group);
    }

    // ========== MIEMBROS ==========
    public List<GroupMemberDto> listMembers(Long groupId) {
        groupRepository.findById(groupId)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id: " + groupId));
        return groupHasUserRepository.findByGroup_Id(groupId)
                .stream().map(this::toMemberDto).toList();
    }

    public List<GroupMemberDto> addMembersByEmail(Long groupId, AddMembersRequestDto body) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id: " + groupId));

        if (body == null || body.userEmails == null || body.userEmails.isEmpty()) {
            return listMembers(groupId);
        }

        for (String email : body.userEmails) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

            if (groupHasUserRepository.existsById_GroupIdAndId_UserId(groupId, user.getId())) {
                throw new IllegalStateException("User already in group: " + email);
            }

            boolean owner = (body.ownerEmail != null && body.ownerEmail.equalsIgnoreCase(email));

            GroupHasUser link = new GroupHasUser();
            link.setGroup(group);
            link.setUser(user);
            link.setOwner(owner);
            link.setId(new GroupUserId(group.getId(), user.getId())); // (groupId, userId)
            groupHasUserRepository.save(link);
        }
        return listMembers(groupId);
    }

    public void removeMember(Long groupId, Long userId) {
        GroupUserId id = new GroupUserId(groupId, userId);
        GroupHasUser link = groupHasUserRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(
                        "Membership not found (groupId=" + groupId + ", userId=" + userId + ")"));
        groupHasUserRepository.delete(link);
    }

    public List<GroupMemberDto> setOwnerFlag(Long groupId, Long userId, boolean isOwner) {
        GroupUserId id = new GroupUserId(groupId, userId);
        GroupHasUser link = groupHasUserRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(
                        "Membership not found (groupId=" + groupId + ", userId=" + userId + ")"));
        link.setOwner(isOwner);
        groupHasUserRepository.save(link);
        return listMembers(groupId);
    }

    private GroupMemberDto toMemberDto(GroupHasUser gu) {
        GroupMemberDto dto = new GroupMemberDto();
        dto.setId(gu.getUser().getId());
        dto.setName(gu.getUser().getName());
        dto.setOwner(gu.isOwner());
        return dto;
    }
}

