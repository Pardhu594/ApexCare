package com.apexcare.auth;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
@Configuration
public class AuthSecurityConfig {
 @Bean SecurityFilterChain filterChain(HttpSecurity http)throws Exception{
  return http.csrf(c->c.disable()).cors(c->{}).authorizeHttpRequests(a->a.anyRequest().permitAll()).build();
 }
 @Bean BCryptPasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
}
