package com.example.restapi.service;

import com.example.restapi.dto.UserRequest;
import com.example.restapi.model.User;
import com.example.restapi.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public List<User> getAllUsers() {
        return repository.findAll();
    }

    public User getUserById(Long id) {
        return repository.findById(id);
    }

    public User createUser(UserRequest request) {

        User user = new User();

        user.setUid(request.getUid());
        user.setName(request.getName());

        return repository.save(user);
    }

    public User updateUser(Long id, UserRequest request) {

        User user = new User();

        user.setUid(request.getUid());
        user.setName(request.getName());

        return repository.update(id, user);
    }

    public boolean deleteUser(Long id) {
        return repository.delete(id);
    }
}