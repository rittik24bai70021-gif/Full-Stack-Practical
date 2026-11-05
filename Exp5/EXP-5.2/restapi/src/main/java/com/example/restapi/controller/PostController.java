package com.example.restapi.controller;

import com.example.restapi.dto.PostRequest;
import com.example.restapi.model.Post;
import com.example.restapi.response.ApiResponse;
import com.example.restapi.service.PostService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService service;

    public PostController(PostService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Post>>> getAllPosts() {

        List<Post> posts = service.getAllPosts();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Posts retrieved successfully",
                        posts
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Post>> getPostById(
            @PathVariable Long id) {

        Post post = service.getPostById(id);

        if (post == null) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Post not found",
                            null
                    ));
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Post retrieved successfully",
                        post
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Post>> createPost(
            @Valid @RequestBody PostRequest request) {

        Post post = service.createPost(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Post created successfully",
                        post
                ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Post>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request) {

        Post post = service.updatePost(id, request);

        if (post == null) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Post not found",
                            null
                    ));
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Post updated successfully",
                        post
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id) {

        boolean deleted = service.deletePost(id);

        if (!deleted) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Post not found",
                            null
                    ));
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Post deleted successfully",
                        null
                )
        );
    }
}