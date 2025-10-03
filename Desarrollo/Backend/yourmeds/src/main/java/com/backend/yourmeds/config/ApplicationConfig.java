package com.backend.yourmeds.config;

import com.backend.yourmeds.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder){
        return authentication -> {
            String username = authentication.getName();
            String password = authentication.getCredentials().toString();

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (!passwordEncoder.matches(password, userDetails.getPassword())){
                throw new BadCredentialsException("Credenciales invalidas");
            }
            return new UsernamePasswordAuthenticationToken(userDetails, password, userDetails.getAuthorities());
        };
    }

    @Bean
    public UserDetailsService userDetailsService(){
        return customUserDetailsService;
    }
}
