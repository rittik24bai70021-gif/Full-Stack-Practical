package com.example.experiment62.repository;

import com.example.experiment62.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    // =========================================
    // Normal Query
    // =========================================
    @Query("SELECT u FROM User u")
    List<User> findUsersNormal();


    // =========================================
    // JOIN FETCH Optimized Query
    // =========================================
    @Query("""
           SELECT u
           FROM User u
           LEFT JOIN FETCH u.address
           """)
    List<User> findUsersWithAddress();


    // =========================================
    // Native SQL Query
    // =========================================
    @Query(
        value = """
                SELECT
                    u.id,
                    u.uid,
                    u.name,
                    a.city,
                    a.country
                FROM users u
                LEFT JOIN addresses a
                    ON u.id = a.user_id
                """,
        nativeQuery = true
    )
    List<Object[]> findUsersNative();


    // =========================================
    // Sort by ID + Fetch Address
    // =========================================
    @Query("""
           SELECT u
           FROM User u
           LEFT JOIN FETCH u.address
           ORDER BY u.id ASC
           """)
    List<User> findAllByOrderByIdAsc();


    // =========================================
    // Sort by Name + Fetch Address
    // =========================================
    @Query("""
           SELECT u
           FROM User u
           LEFT JOIN FETCH u.address
           ORDER BY u.name ASC
           """)
    List<User> findAllByOrderByNameAsc();
}