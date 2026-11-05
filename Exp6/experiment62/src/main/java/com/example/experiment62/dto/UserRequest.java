package com.example.experiment62.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO used to receive user data from API requests.
 */
public class UserRequest {

    // Employee/User unique identifier
    @NotBlank(message = "UID is required")
    @Size(max = 20, message = "UID must not exceed 20 characters")
    private String uid;

    // User name
    @NotBlank(message = "Name is required")
    @Size(
        min = 2,
        max = 50,
        message = "Name must be between 2 and 50 characters"
    )
    private String name;

    // User city
    @NotBlank(message = "City is required")
    @Size(
        min = 2,
        max = 50,
        message = "City must be between 2 and 50 characters"
    )
    private String city;

    // User country
    @NotBlank(message = "Country is required")
    @Size(
        min = 2,
        max = 50,
        message = "Country must be between 2 and 50 characters"
    )
    private String country;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public UserRequest() {
    }


    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }


    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }
}