package com.example.restapi.controller;

import com.example.restapi.dto.UserRequest;
import com.example.restapi.model.User;
import com.example.restapi.response.ApiResponse;
import com.example.restapi.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {

        List<User> users = service.getAllUsers();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Users retrieved successfully",
                        users
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(
            @PathVariable Long id) {

        User user = service.getUserById(id);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "User not found",
                            null
                    ));
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "User retrieved successfully",
                        user
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(
            @Valid @RequestBody UserRequest request) {

        User user = service.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "User created successfully",
                        user
                ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {

        User user = service.updateUser(id, request);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "User not found",
                            null
                    ));
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "User updated successfully",
                        user
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id) {

        boolean deleted = service.deleteUser(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "User not found",
                            null
                    ));
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "User deleted successfully",
                        null
                )
        );
    }
}