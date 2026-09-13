package com.example.experiment62.controller;

import com.example.experiment62.dto.UserRequest;
import com.example.experiment62.model.User;
import com.example.experiment62.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Experiment 6.2.
 *
 * Provides endpoints for:
 *
 * 1. Normal query
 * 2. JOIN FETCH optimized query
 * 3. Cached query
 * 4. Native SQL query
 * 5. Sorting
 * 6. User CRUD operations
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public UserController(UserService userService) {
        this.userService = userService;
    }


    // =========================================================
    // 1. NORMAL QUERY
    // =========================================================

    @GetMapping("/normal")
    public ResponseEntity<?> getNormalUsers() {

        long startTime = System.nanoTime();

        List<User> users = userService.getNormalUsers();

        long endTime = System.nanoTime();

        double executionTime =
                (endTime - startTime) / 1_000_000.0;

        return buildPerformanceResponse(
                true,
                "Normal query executed successfully",
                users,
                executionTime,
                "NORMAL"
        );
    }


    // =========================================================
    // 2. OPTIMIZED QUERY - JOIN FETCH
    // =========================================================

    @GetMapping("/optimized")
    public ResponseEntity<?> getOptimizedUsers() {

        long startTime = System.nanoTime();

        List<User> users = userService.getOptimizedUsers();

        long endTime = System.nanoTime();

        double executionTime =
                (endTime - startTime) / 1_000_000.0;

        return buildPerformanceResponse(
                true,
                "JOIN FETCH optimized query executed successfully",
                users,
                executionTime,
                "JOIN FETCH"
        );
    }


    // =========================================================
    // 3. CACHED QUERY
    // =========================================================

    @GetMapping("/cached")
    public ResponseEntity<?> getCachedUsers() {

        long startTime = System.nanoTime();

        List<User> users = userService.getCachedUsers();

        long endTime = System.nanoTime();

        double executionTime =
                (endTime - startTime) / 1_000_000.0;

        return buildPerformanceResponse(
                true,
                "Cached query executed successfully",
                users,
                executionTime,
                "CACHE"
        );
    }


    // =========================================================
    // 4. NATIVE SQL QUERY
    // =========================================================

    @GetMapping("/native")
    public ResponseEntity<?> getNativeUsers() {

        long startTime = System.nanoTime();

        List<Object[]> results = userService.getNativeUsers();

        long endTime = System.nanoTime();

        double executionTime =
                (endTime - startTime) / 1_000_000.0;

        return buildNativeResponse(
                results,
                executionTime
        );
    }


    // =========================================================
    // 5. SORT BY ID
    // =========================================================

    @GetMapping("/sort/id")
    public ResponseEntity<?> getUsersSortedById() {

        long startTime = System.nanoTime();

        List<User> users =
                userService.getUsersSortedById();

        long endTime = System.nanoTime();

        double executionTime =
                (endTime - startTime) / 1_000_000.0;

        return buildPerformanceResponse(
                true,
                "Users sorted by ID",
                users,
                executionTime,
                "SORT BY ID"
        );
    }


    // =========================================================
    // 6. SORT BY NAME
    // =========================================================

    @GetMapping("/sort/name")
    public ResponseEntity<?> getUsersSortedByName() {

        long startTime = System.nanoTime();

        List<User> users =
                userService.getUsersSortedByName();

        long endTime = System.nanoTime();

        double executionTime =
                (endTime - startTime) / 1_000_000.0;

        return buildPerformanceResponse(
                true,
                "Users sorted by name",
                users,
                executionTime,
                "SORT BY NAME"
        );
    }


    // =========================================================
    // 7. GET USER BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(
            @PathVariable Long id) {

        User user = userService.getUserById(id);

        return ResponseEntity.ok(
                createResponse(
                        true,
                        "User retrieved successfully",
                        user
                )
        );
    }


    // =========================================================
    // 8. ADD USER
    // =========================================================

    @PostMapping
    public ResponseEntity<?> addUser(
            @Valid @RequestBody UserRequest request) {

        User user = userService.addUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                    createResponse(
                        true,
                        "User created successfully",
                        user
                    )
                );
    }


    // =========================================================
    // 9. DELETE USER
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity.ok(
                createResponse(
                        true,
                        "User deleted successfully",
                        null
                )
        );
    }


    // =========================================================
    // 10. CLEAR CACHE
    // =========================================================

    @DeleteMapping("/cache")
    public ResponseEntity<?> clearCache() {

        userService.clearUserCache();

        return ResponseEntity.ok(
                createResponse(
                        true,
                        "User cache cleared successfully",
                        null
                )
        );
    }


    // =========================================================
    // RESPONSE FOR NORMAL / OPTIMIZED / CACHED / SORT QUERIES
    // =========================================================

    private ResponseEntity<?> buildPerformanceResponse(
            boolean success,
            String message,
            List<User> users,
            double executionTime,
            String queryType) {

        Map<String, Object> response =
                new HashMap<>();

        response.put("success", success);
        response.put("message", message);
        response.put("queryType", queryType);
        response.put("executionTimeMs",
                Math.round(executionTime * 100.0) / 100.0);
        response.put("recordCount", users.size());
        response.put("data", users);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // RESPONSE FOR NATIVE SQL
    // =========================================================

    private ResponseEntity<?> buildNativeResponse(
            List<Object[]> results,
            double executionTime) {

        List<Map<String, Object>> users =
                results.stream()
                        .map(row -> {

                            Map<String, Object> user =
                                    new HashMap<>();

                            user.put("id", row[0]);
                            user.put("uid", row[1]);
                            user.put("name", row[2]);
                            user.put("city", row[3]);
                            user.put("country", row[4]);

                            return user;
                        })
                        .toList();

        Map<String, Object> response =
                new HashMap<>();

        response.put("success", true);
        response.put(
                "message",
                "Native SQL query executed successfully"
        );
        response.put("queryType", "NATIVE SQL");
        response.put(
                "executionTimeMs",
                Math.round(executionTime * 100.0) / 100.0
        );
        response.put("recordCount", users.size());
        response.put("data", users);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // COMMON RESPONSE BUILDER
    // =========================================================

    private Map<String, Object> createResponse(
            boolean success,
            String message,
            Object data) {

        Map<String, Object> response =
                new HashMap<>();

        response.put("success", success);
        response.put("message", message);
        response.put("data", data);

        return response;
    }
}