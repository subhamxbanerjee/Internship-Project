package com.centuryply.portal.controller;

import com.centuryply.portal.entity.Role;
import com.centuryply.portal.entity.User;
import com.centuryply.portal.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
    }

  @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {

    try {
        System.out.println("======================================");
        System.out.println("LOGIN ATTEMPT");
        System.out.println("Username: " + request.getUsername());
        System.out.println("======================================");

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(auth);

        System.out.println("LOGIN SUCCESS");
        System.out.println("Authenticated User: " + auth.getName());
        System.out.println("Authorities: " + auth.getAuthorities());

        Map<String, Object> response = new HashMap<>();
        response.put("username", auth.getName());
        response.put("role", auth.getAuthorities()
                .stream()
                .findFirst()
                .map(Object::toString)
                .orElse("EMPLOYEE"));

        return ResponseEntity.ok(response);

    } catch (Exception e) {

        System.out.println("======================================");
        System.out.println("LOGIN FAILED");
        System.out.println("Username: " + request.getUsername());
        System.out.println("Exception: " + e.getClass().getSimpleName());
        System.out.println("Message: " + e.getMessage());
        System.out.println("======================================");

        e.printStackTrace();

        return ResponseEntity.status(401).body(
                Map.of(
                        "message", "Invalid username or password",
                        "exception", e.getClass().getSimpleName(),
                        "details", e.getMessage()
                )
        );
    }
}

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        User user = new User(request.getUsername(), request.getPassword(), request.getFullName(), request.getEmail(), Role.EMPLOYEE);
        userService.save(user);
        return ResponseEntity.ok(Map.of("message", "User created"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(Authentication auth) {
        User user = userService.findByUsername(auth.getName()).orElseThrow();
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication auth, @RequestBody ChangePasswordRequest request) {
        User user = userService.findByUsername(auth.getName()).orElseThrow();
        if (!userService.matchesPassword(user, request.getCurrentPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect"));
        }
        userService.resetPassword(user.getId(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class RegisterRequest {
        private String username;
        private String password;
        private String fullName;
        private String email;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}
