package com.backend.yourmeds.service;

import com.backend.yourmeds.dto.group.*;
import com.backend.yourmeds.entity.Group;
import com.backend.yourmeds.entity.GroupHasUser;
import com.backend.yourmeds.entity.User;
import com.backend.yourmeds.entity.id.GroupUserId;
import com.backend.yourmeds.repository.GroupHasUserRepository;
import com.backend.yourmeds.repository.GroupRepository;
import com.backend.yourmeds.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    private GroupResponseDto toResponse(Group entity){
        GroupResponseDto dto = new GroupResponseDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        return dto;
    }

    public GroupResponseDto create(CreateGroupRequestDto request){
        Group group = new Group();
        group.setName(request.name);
        group.setDescription(request.description);
        group.setPrivate(request.is_private);
        Group saved = groupRepository.save(group);
        return toResponse(saved);
    }

    public GroupResponseDto findById(Long id){
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id: " + id));
        return toResponse(group);
    }

    public GroupResponseDto update(Long id, UpdateGroupRequestDto request){
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id: " + id));

        if (request.name != null) group.setName(request.name);
        if (request.description != null) group.setDescription(request.description);

        Group saved = groupRepository.save(group);
        return toResponse(saved);
    }

    public void delete(Long id){
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id: " + id));
        groupRepository.delete(group);
    }
    // METODOS PARA MIEMBROS
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
                // si prefieres ignorar en vez de error, comenta esta línea y continúa
                throw new IllegalStateException("User already in group: " + email);
            }
            boolean owner = (body.ownerEmail != null && body.ownerEmail.equalsIgnoreCase(email));
            GroupHasUser link = new GroupHasUser();
            link.setGroup(group);
            link.setUser(user);
            link.setOwner(owner);
            link.setId(new GroupUserId(group.getId(), user.getId()));
            groupHasUserRepository.save(link);
        }
        return listMembers(groupId);
    }

    public void removeMember(Long groupId, Long userId) {
        GroupUserId id = new GroupUserId(groupId, userId);
        GroupHasUser link = groupHasUserRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Membership not found (groupId=" + groupId + ", userId=" + userId + ")"));
        groupHasUserRepository.delete(link);
    }

    public List<GroupMemberDto> setOwnerFlag(Long groupId, Long userId, boolean isOwner) {
        GroupUserId id = new GroupUserId(groupId, userId);
        GroupHasUser link = groupHasUserRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Membership not found (groupId=" + groupId + ", userId=" + userId + ")"));
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

