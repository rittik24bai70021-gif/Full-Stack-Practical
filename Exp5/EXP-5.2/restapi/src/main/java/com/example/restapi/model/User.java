package com.example.restapi.model;

public class User {

    private Long id;
    private String uid;
    private String name;

    public User() {
    }

    public User(Long id, String uid, String name) {
        this.id = id;
        this.uid = uid;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
}