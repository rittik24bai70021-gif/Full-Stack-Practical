package com.example.restapi.service;

import com.example.restapi.dto.PostRequest;
import com.example.restapi.model.Post;
import com.example.restapi.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    private final PostRepository repository;

    public PostService(PostRepository repository) {
        this.repository = repository;
    }

    public List<Post> getAllPosts() {
        return repository.findAll();
    }

    public Post getPostById(Long id) {
        return repository.findById(id);
    }

    public Post createPost(PostRequest request) {

        Post post = new Post();

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());

        return repository.save(post);
    }

    public Post updatePost(Long id, PostRequest request) {

        Post post = new Post();

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());

        return repository.update(id, post);
    }

    public boolean deletePost(Long id) {
        return repository.delete(id);
    }
}