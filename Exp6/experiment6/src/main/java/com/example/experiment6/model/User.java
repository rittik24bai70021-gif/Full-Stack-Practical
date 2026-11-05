package com.example.experiment6.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "users")
public class User {

    @Id
    @NotBlank(message = "UID is required")
    private String uid;

    @NotBlank(message = "Name is required")
    @Size(
        min = 2,
        max = 50,
        message = "Name must be between 2 and 50 characters"
    )
    private String name;

    // Default constructor
    public User() {
    }

    // Parameterized constructor
    public User(String uid, String name) {
        this.uid = uid;
        this.name = name;
    }

    // Getter for UID
    public String getUid() {
        return uid;
    }

    // Setter for UID
    public void setUid(String uid) {
        this.uid = uid;
    }

    // Getter for Name
    public String getName() {
        return name;
    }

    // Setter for Name
    public void setName(String name) {
        this.name = name;
    }
}