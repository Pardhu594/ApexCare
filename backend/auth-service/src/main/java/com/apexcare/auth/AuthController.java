package com.apexcare.auth;

import com.apexcare.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserAccountRepository users;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserAccountRepository users) {
        this.users = users;
    }

    public static class RegisterRequest {
        @NotBlank
        @Size(max = 100)
        private String name;

        @Email
        @NotBlank
        private String email;

        @NotBlank
        @Size(min = 8, max = 100)
        private String password;

        public RegisterRequest() {}

        public String name() { return name; }
        public String email() { return email; }
        public String password() { return password; }

        public void setName(String name) { this.name = name; }
        public void setEmail(String email) { this.email = email; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginRequest {
        @Email
        @NotBlank
        private String email;

        @NotBlank
        private String password;

        public LoginRequest() {}

        public String email() { return email; }
        public String password() { return password; }

        public void setEmail(String email) { this.email = email; }
        public void setPassword(String password) { this.password = password; }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest r) {
        String email = r.email().trim().toLowerCase();

        if (users.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(409)
                    .body(Map.of("error", "An account with this email already exists."));
        }

        UserAccount user = users.save(
                new UserAccount(r.name().trim(), email, encoder.encode(r.password()))
        );

        String token = JwtUtil.create(user.getEmail());

        return ResponseEntity.status(201).body(Map.of(
                "token", token,
                "name", user.getName(),
                "email", user.getEmail(),
                "message", "Registration successful"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest r) {
        return users.findByEmailIgnoreCase(r.email().trim())
                .filter(u -> encoder.matches(r.password(), u.getPasswordHash()))
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(Map.of(
                        "token", JwtUtil.create(u.getEmail()),
                        "name", u.getName(),
                        "email", u.getEmail()
                )))
                .orElseGet(() -> ResponseEntity.status(401)
                        .body(Map.of("error", "Invalid email or password.")));
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "auth-service");
    }
}