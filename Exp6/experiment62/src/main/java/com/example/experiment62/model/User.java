package com.example.experiment62.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * User Entity
 *
 * Represents a user in the system.
 * Each user can have one address.
 */
@Entity
@Table(name = "users")
public class User {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // USER INFORMATION
    // =========================================================

    @Column(nullable = false, unique = true, length = 20)
    private String uid;

    @Column(nullable = false, length = 50)
    private String name;


    // =========================================================
    // ONE-TO-ONE RELATIONSHIP
    // =========================================================
    //
    // LAZY loading is intentionally used here.
    //
    // This is important for Experiment 6.2 because we will
    // compare:
    //
    // 1. Normal query
    // 2. JOIN FETCH optimized query
    //
    // JOIN FETCH can load the User and Address together
    // instead of relying on separate lazy-loading queries.
    // =========================================================

    @OneToOne(
        mappedBy = "user",
        cascade = CascadeType.ALL,
        fetch = FetchType.LAZY,
        orphanRemoval = true
    )
    @JsonManagedReference
    private Address address;


    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public User() {
    }


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public User(String uid, String name) {
        this.uid = uid;
        this.name = name;
    }


    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public String getUid() {
        return uid;
    }

    public String getName() {
        return name;
    }

    public Address getAddress() {
        return address;
    }


    // =========================================================
    // SETTERS
    // =========================================================

    public void setUid(String uid) {
        this.uid = uid;
    }

    public void setName(String name) {
        this.name = name;
    }


    /**
     * Sets the user's address.
     *
     * Also maintains the bidirectional relationship by
     * setting this User inside the Address entity.
     */
    public void setAddress(Address address) {

        this.address = address;

        if (address != null) {
            address.setUser(this);
        }
    }


    // =========================================================
    // TO STRING
    // =========================================================

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", uid='" + uid + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}