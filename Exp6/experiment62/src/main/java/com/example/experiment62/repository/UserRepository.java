package com.example.experiment62.repository;

import com.example.experiment62.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Repository layer for User entity.
 *
 * This repository demonstrates different database access
 * techniques required for Experiment 6.2:
 *
 * 1. Normal JPQL query
 * 2. JOIN FETCH optimization
 * 3. Native SQL query
 * 4. Sorting by ID
 * 5. Sorting by Name
 */
public interface UserRepository extends JpaRepository<User, Long> {


    // =========================================================
    // 1. NORMAL QUERY
    // =========================================================
    //
    // Fetches only User entities.
    //
    // The Address relationship is LAZY, so the address is not
    // intentionally fetched together with the initial query.
    //
    // This is useful for comparing the normal query against
    // the optimized JOIN FETCH query.
    // =========================================================

    @Query("""
        SELECT u
        FROM User u
        """)
    List<User> findUsersNormal();


    // =========================================================
    // 2. OPTIMIZED QUERY - JOIN FETCH
    // =========================================================
    //
    // Fetches User and Address in a single query.
    //
    // JOIN FETCH is used to reduce additional queries caused
    // by lazy loading of the Address relationship.
    // =========================================================

    @Query("""
        SELECT u
        FROM User u
        LEFT JOIN FETCH u.address
        """)
    List<User> findUsersWithAddress();


    // =========================================================
    // 3. NATIVE SQL QUERY
    // =========================================================
    //
    // Direct SQL query executed against MySQL.
    //
    // The result is returned as Object[] because the query
    // selects columns from two different tables.
    //
    // Object[] structure:
    //
    // [0] -> User ID
    // [1] -> UID
    // [2] -> Name
    // [3] -> City
    // [4] -> Country
    // =========================================================

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
            ORDER BY u.id ASC
            """,
        nativeQuery = true
    )
    List<Object[]> findUsersNative();


    // =========================================================
    // 4. SORT USERS BY DATABASE ID
    // =========================================================

    List<User> findAllByOrderByIdAsc();


    // =========================================================
    // 5. SORT USERS BY NAME
    // =========================================================

    List<User> findAllByOrderByNameAsc();
}