package com.rittik.streamops;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
public class EventRecord {
 @Id public String eventId;
 @Column(nullable=false,length=2000) public String content;
 public String status;
 public int attempts;
 public int failuresBeforeSuccess;
 @Column(length=2000) public String lastError;
 public Instant createdAt;
 public Instant updatedAt;
 public EventRecord() {}
 public EventRecord(String id,String text,int failures) { eventId=id;content=text;failuresBeforeSuccess=failures;status="QUEUED";createdAt=updatedAt=Instant.now(); }
}
