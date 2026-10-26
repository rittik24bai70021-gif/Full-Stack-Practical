package com.rittik.canarydock;
import java.time.Instant;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestController @RequestMapping("/api")
public class ApiController {
 private final LabService lab;
 @Value("${app.version}") private String version;
 @Value("${app.slot}") private String slot;
 @Value("${app.demo-enabled}") private boolean demoEnabled;
 public ApiController(LabService lab){this.lab=lab;}
 @GetMapping("/info") public Map<String,Object> info(){return Map.of("name","CanaryDock","author","Rittik Basak","uid","24BAI70021","version",version,"slot",slot,"demoEnabled",demoEnabled);}
 @GetMapping("/hello") public ResponseEntity<Map<String,String>> hello(){return ResponseEntity.ok().header("X-Release-Slot",slot).body(Map.of("message","Delivered safely. Built to evolve.","version",version,"slot",slot,"timestamp",Instant.now().toString()));}
 private void enabled(){if(!demoEnabled)throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Classroom lab is disabled on this deployment.");}
 @GetMapping("/lab") public Map<String,Object> state(){enabled();return lab.snapshot();}
 public record Command(String action,String version){}
 @PostMapping("/lab") public Map<String,Object> action(@RequestBody Command command){enabled();if(command.action()==null)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Action is required.");return lab.action(command.action(),command.version());}
}
