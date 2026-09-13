package com.example.restapi.controller;

import com.example.restapi.dto.UserRequest;
import com.example.restapi.model.User;
import com.example.restapi.response.ApiResponse;
import com.example.restapi.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:5500",
                "http://127.0.0.1:5500"
        }
)
public class UserController {

    private final UserService service;


    public UserController(UserService service) {

        this.service = service;
    }


    // =====================================================
    // GET ALL USERS
    // =====================================================

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


    // =====================================================
    // GET USER BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(
            @PathVariable Long id) {

        User user = service.getUserById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "User retrieved successfully",
                        user
                )
        );
    }


    // =====================================================
    // CREATE USER
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(
            @Valid @RequestBody UserRequest request) {

        User user = service.createUser(request);

        return ResponseEntity.status(201)
                .body(
                        new ApiResponse<>(
                                true,
                                "User created successfully",
                                user
                        )
                );
    }


    // =====================================================
    // UPDATE USER
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {

        User user = service.updateUser(id, request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "User updated successfully",
                        user
                )
        );
    }


    // =====================================================
    // DELETE USER
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id) {

        service.deleteUser(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "User deleted successfully",
                        null
                )
        );
    }
}