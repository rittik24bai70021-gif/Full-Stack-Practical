package com.example.experiment62.service;

import com.example.experiment62.dto.UserRequest;
import com.example.experiment62.model.Address;
import com.example.experiment62.model.User;
import com.example.experiment62.repository.UserRepository;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for Experiment 6.2.
 *
 * Demonstrates:
 *
 * - Normal database query
 * - JOIN FETCH optimization
 * - Cacheable query
 * - Cache eviction
 * - Native SQL
 * - Sorting
 * - CRUD operations
 */
@Service
public class UserService {

    private final UserRepository userRepository;


    // =========================================================
    // CONSTRUCTOR INJECTION
    // =========================================================

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    // =========================================================
    // 1. NORMAL QUERY
    // =========================================================

    @Transactional(readOnly = true)
    public List<User> getNormalUsers() {

        return userRepository.findUsersNormal();
    }


    // =========================================================
    // 2. JOIN FETCH OPTIMIZED QUERY
    // =========================================================

    @Transactional(readOnly = true)
    public List<User> getOptimizedUsers() {

        return userRepository.findUsersWithAddress();
    }


    // =========================================================
    // 3. CACHED QUERY
    // =========================================================
    //
    // First request:
    //     Database is queried.
    //
    // Second request:
    //     Result comes from Ehcache.
    //
    // Cache:
    //     users
    //
    // Key:
    //     allUsers
    // =========================================================

    @Cacheable(
        value = "users",
        key = "'allUsers'",
        unless = "#result == null || #result.isEmpty()"
    )
    @Transactional(readOnly = true)
    public List<User> getCachedUsers() {

        System.out.println(
            ">>> CACHE MISS - Fetching users from DATABASE <<<"
        );

        return userRepository.findUsersWithAddress();
    }


    // =========================================================
    // 4. NATIVE SQL QUERY
    // =========================================================

    @Transactional(readOnly = true)
    public List<Object[]> getNativeUsers() {

        return userRepository.findUsersNative();
    }


    // =========================================================
    // 5. SORT BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public List<User> getUsersSortedById() {

        return userRepository.findAllByOrderByIdAsc();
    }


    // =========================================================
    // 6. SORT BY NAME
    // =========================================================

    @Transactional(readOnly = true)
    public List<User> getUsersSortedByName() {

        return userRepository.findAllByOrderByNameAsc();
    }


    // =========================================================
    // 7. GET USER BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public User getUserById(Long id) {

        return userRepository.findById(id)
            .orElseThrow(() ->
                new RuntimeException(
                    "User not found with ID: " + id
                )
            );
    }


    // =========================================================
    // 8. ADD USER
    // =========================================================
    //
    // After adding a user, cached user data becomes outdated.
    //
    // Therefore, the users cache is automatically cleared.
    // =========================================================

    @CacheEvict(
        value = "users",
        allEntries = true
    )
    public User addUser(UserRequest request) {

        User user = new User();

        user.setUid(request.getUid());
        user.setName(request.getName());


        Address address = new Address();

        address.setCity(request.getCity());
        address.setCountry(request.getCountry());


        // Maintain bidirectional relationship
        user.setAddress(address);


        return userRepository.save(user);
    }


    // =========================================================
    // 9. DELETE USER
    // =========================================================

    @CacheEvict(
        value = "users",
        allEntries = true
    )
    public void deleteUser(Long id) {

        if (!userRepository.existsById(id)) {

            throw new RuntimeException(
                "User not found with ID: " + id
            );
        }

        userRepository.deleteById(id);
    }


    // =========================================================
    // 10. CLEAR CACHE
    // =========================================================
    //
    // Useful for demonstrating cache eviction manually.
    // =========================================================

    @CacheEvict(
        value = "users",
        allEntries = true
    )
    public void clearUserCache() {

        System.out.println(
            ">>> USER CACHE CLEARED <<<"
        );
    }
}