package com.example.restapi.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(Long id) {
        super("User not found with UID: " + id);
    }
}