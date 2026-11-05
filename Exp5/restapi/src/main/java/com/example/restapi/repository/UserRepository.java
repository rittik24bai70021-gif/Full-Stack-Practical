package com.example.restapi.repository;

import com.example.restapi.model.User;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class UserRepository {

    private final List<User> users = new ArrayList<>();

    private Long nextId = 1L;

    public List<User> findAll() {
        return users;
    }

    public User findById(Long id) {
        return users.stream()
                .filter(user -> user.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public User save(User user) {
        user.setId(nextId++);
        users.add(user);
        return user;
    }

    public User update(Long id, User updatedUser) {

        User existingUser = findById(id);

        if (existingUser != null) {
            existingUser.setUid(updatedUser.getUid());
            existingUser.setName(updatedUser.getName());
        }

        return existingUser;
    }

    public boolean delete(Long id) {

        User user = findById(id);

        if (user != null) {
            users.remove(user);
            return true;
        }

        return false;
    }
}