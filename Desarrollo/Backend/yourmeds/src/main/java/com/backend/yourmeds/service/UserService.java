package com.backend.yourmeds.service;

import com.backend.yourmeds.dto.alarm.AlarmSummaryDto;
import com.backend.yourmeds.dto.alarm.UserOverviewDto;
import com.backend.yourmeds.dto.group.GroupMemberDto;
import com.backend.yourmeds.dto.role.RoleDto;
import com.backend.yourmeds.dto.user.*;
import com.backend.yourmeds.entity.*;
import com.backend.yourmeds.repository.*;
import com.backend.yourmeds.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserHasRolesRepository userHasRolesRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    GroupHasUserRepository groupHasUserRepository;

    @Autowired
    AlarmRepository alarmRepository;

    @Transactional
    public CreateUserResponseDto createUser(CreateUserRequestDto createUserRequestDto){
        if (userRepository.existsByEmail(createUserRequestDto.email)) {
            throw  new RuntimeException("El correo está registrado");
        }
        User user = new User();
        user.setEmail(createUserRequestDto.email);
        user.setRut(createUserRequestDto.rut);
        user.setName(createUserRequestDto.name);
        user.setLastName(createUserRequestDto.lastName);
        user.setAge(createUserRequestDto.age);

        String encryptedPassword = passwordEncoder.encode(createUserRequestDto.password);
        user.setPassword(encryptedPassword);

        User savedUser = userRepository.save(user);
        Role clientRole = roleRepository.findById("USER").orElseThrow(
                () -> new RuntimeException("El rol de USER no existe")
        );
        UserHasRoles userHasRoles =new UserHasRoles(savedUser, clientRole);
        userHasRolesRepository.save(userHasRoles);

        CreateUserResponseDto response = new CreateUserResponseDto();
        response.setId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setRut(savedUser.getRut());
        response.setName(savedUser.getName());
        response.setLastName(savedUser.getLastName());
        response.setAge(savedUser.getAge());
        response.setNotificationToken(savedUser.getNotificationToken());

        List<Role> roles = roleRepository.findAllByUsers_User_Id(savedUser.getId());
        List<RoleDto> roleDtos = roles.stream()
                .map(role -> new RoleDto(
                        role.getId(),
                        role.getName(),
                        role.getRoute()
                )).toList();
        response.setRoles(roleDtos);

        return response;
    }

    @Transactional
    public LoginResponseDto LoginUser(LoginRequestDto loginRequestDto){
        User user = userRepository.findByEmail(loginRequestDto.getEmail())
                .orElseThrow(() -> new RuntimeException("El email o password no son validos"));
        if (!passwordEncoder.matches(loginRequestDto.getPassword(), user.getPassword())) {
            throw new RuntimeException("El email o password no son validos");
        }
        String token = jwtUtil.generateToken(user);
        List<Role> roles = roleRepository.findAllByUsers_User_Id(user.getId());
        List<RoleDto> roleDtos = roles.stream()
                .map(role -> new RoleDto(
                        role.getId(),
                        role.getName(),
                        role.getRoute()
                )).toList();

        CreateUserResponseDto createUserResponseDto = new CreateUserResponseDto();
        createUserResponseDto.setEmail(user.getEmail());
        createUserResponseDto.setId(user.getId());
        createUserResponseDto.setRut(user.getRut());
        createUserResponseDto.setName(user.getName());
        createUserResponseDto.setLastName(user.getLastName());
        createUserResponseDto.setAge(user.getAge());
        createUserResponseDto.setRoles(roleDtos);

        LoginResponseDto loginResponseDto = new LoginResponseDto();
        loginResponseDto.setToken("Bearer " + token);
        loginResponseDto.setUser(createUserResponseDto);

        return loginResponseDto;
    }

    @Transactional
    public CreateUserResponseDto findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El email o password no son validos"));

        List<Role> roles = roleRepository.findAllByUsers_User_Id(user.getId());
        List<RoleDto> roleDtos = roles.stream()
                .map(role -> new RoleDto(
                        role.getId(),
                        role.getName(),
                        role.getRoute()
                )).toList();

        CreateUserResponseDto createUserResponseDto = new CreateUserResponseDto();
        createUserResponseDto.setEmail(user.getEmail());
        createUserResponseDto.setId(user.getId());
        createUserResponseDto.setRut(user.getRut());
        createUserResponseDto.setName(user.getName());
        createUserResponseDto.setLastName(user.getLastName());
        createUserResponseDto.setAge(user.getAge());
        createUserResponseDto.setRoles(roleDtos);

        return createUserResponseDto;
    }

    // METODOS ESPECIFICOS PARA LISTAR MIEMBROS DE GRUPOS
    public UserOverviewDto getOverview(Long userId){
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + userId));

        List<GroupHasUser> memberships = groupHasUserRepository.findByUser_Id(userId);

        UserOverviewDto root = new UserOverviewDto();
        root.setUserId(u.getId());
        root.setName(u.getName());

        List<UserGroupDto> groups = memberships.stream().map(m -> {
            var g = m.getGroup();

            UserGroupDto gDto = new UserGroupDto();
            gDto.setGroupId(g.getId());
            gDto.setName(g.getName());
            gDto.setPrivate(g.isPrivate());
            gDto.setOwner(m.isOwner());
            gDto.setColor(g.getColor());

            // miembros del grupo
            List<GroupMemberDto> members = groupHasUserRepository.findByGroup_Id(g.getId())
                    .stream().map(gu -> {
                        GroupMemberDto d = new GroupMemberDto();
                        d.setId(gu.getUser().getId());
                        d.setName(gu.getUser().getName());
                        d.setOwner(gu.isOwner());
                        return d;
                    }).toList();
            gDto.setUsers(members);

            // alarmas del grupo
            List<AlarmSummaryDto> alarms = alarmRepository.findByGroup_IdOrderByDateStartAsc(g.getId())
                    .stream().map(this::toAlarmSummary).toList();
            gDto.setAlarms(alarms);

            return gDto;
        }).toList();

        root.setGroups(groups);
        return root;
    }

    // METODO PARA OBTENER ID DEL USUARIO
    public Long getCurrentUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("Información email no encontrada"));
    }

    private AlarmSummaryDto toAlarmSummary(Alarm a){
        AlarmSummaryDto d = new AlarmSummaryDto();
        d.setId(a.getId());
        d.setName(a.getName());
        d.setAlarm_type((a.isAlarmType()));
        d.setActive(a.isActive());
        d.setCant(a.getCant());
        d.setTime_alarm(a.getTimeAlarm());
        d.setDate_start(a.getDateStart());
        d.setDate_end(a.getDateEnd());
        d.setDescription(a.getDescription());
        return d;
    }
}

