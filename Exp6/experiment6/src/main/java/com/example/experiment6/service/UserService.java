package com.example.experiment6.service;

import com.example.experiment6.dto.PageResponse;
import com.example.experiment6.dto.UserRequest;
import com.example.experiment6.model.User;
import com.example.experiment6.repository.UserRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    // Constructor injection
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ==========================
    // CREATE USER
    // ==========================

    public User createUser(UserRequest request) {

        if (userRepository.existsById(request.getUid())) {
            throw new RuntimeException(
                    "User already exists with UID: " + request.getUid()
            );
        }

        User user = new User(
                request.getUid(),
                request.getName()
        );

        return userRepository.save(user);
    }

    // ==========================
    // PAGINATION + SORTING
    // ==========================

    public PageResponse<User> getUsers(Pageable pageable) {

        Page<User> page = userRepository.findAll(pageable);

        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    // ==========================
    // DELETE USER
    // ==========================

    public void deleteUser(String uid) {

        if (!userRepository.existsById(uid)) {
            throw new RuntimeException(
                    "User not found with UID: " + uid
            );
        }

        userRepository.deleteById(uid);
    }
}