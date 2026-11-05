package com.example.restapi.service;

import com.example.restapi.dto.UserRequest;
import com.example.restapi.exception.UserNotFoundException;
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


    // =====================================================
    // GET ALL USERS
    // =====================================================

    public List<User> getAllUsers() {

        return repository.findAll();
    }


    // =====================================================
    // GET USER BY ID
    // =====================================================

    public User getUserById(Long id) {

        User user = repository.findById(id);

        if (user == null) {

            throw new UserNotFoundException(id);
        }

        return user;
    }


    // =====================================================
    // CREATE USER
    // =====================================================

    public User createUser(UserRequest request) {

        User user = new User();

        user.setUid(request.getUid());
        user.setName(request.getName());

        return repository.save(user);
    }


    // =====================================================
    // UPDATE USER
    // =====================================================

    public User updateUser(Long id, UserRequest request) {

        User existingUser = repository.findById(id);

        if (existingUser == null) {

            throw new UserNotFoundException(id);
        }


        User user = new User();

        user.setUid(request.getUid());
        user.setName(request.getName());

        User updatedUser = repository.update(id, user);

        return updatedUser;
    }


    // =====================================================
    // DELETE USER
    // =====================================================

    public boolean deleteUser(Long id) {

        User existingUser = repository.findById(id);

        if (existingUser == null) {

            throw new UserNotFoundException(id);
        }


        return repository.delete(id);
    }
}