package com.example.restapi.repository;

import com.example.restapi.model.Post;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class PostRepository {

    private final List<Post> posts = new ArrayList<>();

    private Long nextId = 1L;

    public List<Post> findAll() {
        return posts;
    }

    public Post findById(Long id) {
        return posts.stream()
                .filter(post -> post.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public Post save(Post post) {
        post.setId(nextId++);
        posts.add(post);
        return post;
    }

    public Post update(Long id, Post updatedPost) {

        Post existingPost = findById(id);

        if (existingPost != null) {
            existingPost.setTitle(updatedPost.getTitle());
            existingPost.setContent(updatedPost.getContent());
        }

        return existingPost;
    }

    public boolean delete(Long id) {

        Post post = findById(id);

        if (post != null) {
            posts.remove(post);
            return true;
        }

        return false;
    }
}