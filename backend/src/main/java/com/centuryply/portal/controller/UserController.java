package com.centuryply.portal.controller;

import com.centuryply.portal.entity.Role;
import com.centuryply.portal.entity.User;
import com.centuryply.portal.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> listUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PostMapping
    public ResponseEntity<?> addUser(@RequestBody CreateUserRequest request) {
        try {
            User user = new User(request.getUsername(), request.getPassword(), request.getFullName(), request.getEmail(), request.getRole());
            return ResponseEntity.ok(userService.save(user));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable("id") Long id, @RequestBody UpdateUserRequest request) {
        User user = userService.findById(id).orElseThrow();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setActive(request.isActive());
        return ResponseEntity.ok(userService.update(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable("id") Long id) {
        userService.delete(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable("id") Long id, @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(id, request.getPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset"));
    }

    public static class CreateUserRequest {
        private String username;
        private String password;
        private String fullName;
        private String email;
        private Role role;

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

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }
    }

    public static class UpdateUserRequest {
        private String fullName;
        private String email;
        private Role role;
        private boolean active;

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

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }

        public boolean isActive() {
            return active;
        }

        public void setActive(boolean active) {
            this.active = active;
        }
    }

    public static class ResetPasswordRequest {
        private String password;

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
