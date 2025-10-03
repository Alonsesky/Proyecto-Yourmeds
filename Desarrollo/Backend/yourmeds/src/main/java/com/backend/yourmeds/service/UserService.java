package com.backend.yourmeds.service;

import com.backend.yourmeds.dto.role.RoleDto;
import com.backend.yourmeds.dto.user.CreateUserRequestDto;
import com.backend.yourmeds.dto.user.CreateUserResponseDto;
import com.backend.yourmeds.dto.user.LoginRequestDto;
import com.backend.yourmeds.dto.user.LoginResponseDto;
import com.backend.yourmeds.entity.Role;
import com.backend.yourmeds.entity.User;
import com.backend.yourmeds.entity.UserHasRoles;
import com.backend.yourmeds.repository.RoleRepository;
import com.backend.yourmeds.repository.UserHasRolesRepository;
import com.backend.yourmeds.repository.UserRepository;
import com.backend.yourmeds.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
}
