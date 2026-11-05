package com.example.experiment62.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Address Entity
 *
 * Stores the address information associated with a User.
 *
 * Relationship:
 * User 1 -------- 1 Address
 */
@Entity
@Table(name = "addresses")
public class Address {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // ADDRESS INFORMATION
    // =========================================================

    @Column(nullable = false, length = 50)
    private String city;

    @Column(nullable = false, length = 50)
    private String country;


    // =========================================================
    // USER RELATIONSHIP
    // =========================================================
    //
    // Address is the owning side of the relationship because
    // the foreign key user_id is stored in this table.
    //
    // @JsonBackReference prevents infinite JSON serialization:
    //
    // User -> Address
    // Address -> User  X
    //
    // =========================================================

    @JsonBackReference
    @OneToOne(
        fetch = FetchType.LAZY
    )
    @JoinColumn(
        name = "user_id",
        nullable = false,
        unique = true
    )
    private User user;


    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public Address() {
    }


    // =========================================================
    // PARAMETERIZED CONSTRUCTOR
    // =========================================================

    public Address(String city, String country) {
        this.city = city;
        this.country = country;
    }


    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public User getUser() {
        return user;
    }


    // =========================================================
    // SETTERS
    // =========================================================

    public void setCity(String city) {
        this.city = city;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setUser(User user) {
        this.user = user;
    }


    // =========================================================
    // TO STRING
    // =========================================================

    @Override
    public String toString() {
        return "Address{" +
                "id=" + id +
                ", city='" + city + '\'' +
                ", country='" + country + '\'' +
                '}';
    }
}