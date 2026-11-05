package com.rittik.streamops;
import jakarta.validation.Valid;
import java.util.*;
import java.util.concurrent.TimeUnit;
import org.apache.kafka.clients.admin.AdminClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api")
@CrossOrigin(origins={"http://localhost:3003","http://127.0.0.1:3003"})
public class EventController {
 private final EventService events;
 @Value("${spring.kafka.bootstrap-servers}") private String brokers;
 public EventController(EventService events){this.events=events;}
 @GetMapping("/events") public List<EventRecord> list(){return events.list();}
 @GetMapping("/events/{id}") public EventRecord get(@PathVariable String id){return events.get(id);}
 @PostMapping("/events") public ResponseEntity<EventRecord> submit(@Valid @RequestBody EventRequest request){return ResponseEntity.status(HttpStatus.ACCEPTED).body(events.submit(request));}
 @GetMapping("/health") public Map<String,Object> health(){
  boolean available=false;
  try(var admin=AdminClient.create(Map.of("bootstrap.servers",brokers,"request.timeout.ms",1500,"default.api.timeout.ms",2000))){available=!admin.describeCluster().nodes().get(2,TimeUnit.SECONDS).isEmpty();}
  catch(Exception ignored){}
  return Map.of("api","UP","kafka",available?"UP":"DOWN","broker",brokers);
 }
}
