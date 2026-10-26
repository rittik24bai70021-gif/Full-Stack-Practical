package com.rittik.canarydock;
import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
/** In-memory teaching model. It does not execute Docker or alter production. */
@Service
public class LabService {
 private String phase="READY",stable="v1.0.0",candidate="v1.1.0",previous="v1.0.0";
 private int weight=0,stableHits=0,canaryHits=0,failures=0,batch=0;
 private boolean faulty=false;
 private final Deque<Map<String,Object>> events=new ArrayDeque<>();
 public LabService(){log("Lab ready. Create a candidate release to begin.");}
 private void log(String message){events.addFirst(Map.of("time",Instant.now().toString(),"message",message));while(events.size()>60)events.removeLast();}
 private void require(boolean ok,String message){if(!ok)throw new ResponseStatusException(HttpStatus.CONFLICT,message);}
 public synchronized Map<String,Object> snapshot(){return Map.ofEntries(
 Map.entry("mode","CLASSROOM LAB"),Map.entry("phase",phase),Map.entry("stable",stable),Map.entry("candidate",candidate),
 Map.entry("weight",weight),Map.entry("stableHits",stableHits),Map.entry("canaryHits",canaryHits),Map.entry("failures",failures),
 Map.entry("faulty",faulty),Map.entry("batch",batch),Map.entry("events",List.copyOf(events)));}
 public synchronized Map<String,Object> action(String action,String version){
 switch(action){
 case "start" -> {require(!phase.equals("CANARY"),"Finish or roll back the current release first.");
 if(version==null||!version.matches("v[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}"))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Use a version such as v1.1.0 (maximum three digits per part).");
 require(!version.equals(stable),"Candidate must differ from stable.");
 previous=stable;candidate=version;phase="CANARY";weight=10;stableHits=canaryHits=failures=batch=0;faulty=false;
 log("Candidate "+candidate+" started with 10% simulated traffic.");}
 case "traffic" -> {require(phase.equals("CANARY"),"Start a release first.");
 int c=weight;canaryHits+=c;stableHits+=100-c;batch++;
 if(faulty){failures+=c;weight=0;phase="ROLLED_BACK";log("Health gate failed. Automatic rollback: 100% to "+stable+".");}
 else log("100 simulated requests completed; "+c+" candidate requests succeeded.");}
 case "advance" -> {require(phase.equals("CANARY")&&batch>0&&!faulty,"Run a healthy traffic batch before advancing.");
 if(weight==10)weight=50;else {weight=100;stable=candidate;phase="PROMOTED";}batch=0;
 log(weight==100?"Promotion complete: "+stable+" serves 100%.":"Health gate passed: candidate raised to 50%.");}
 case "fault" -> {require(phase.equals("CANARY"),"Start a release first.");faulty=!faulty;batch=0;log(faulty?"Failure injection enabled for the next simulated batch.":"Failure injection disabled.");}
 case "rollback" -> {require(phase.equals("CANARY")||phase.equals("PROMOTED"),"No active release to roll back.");stable=previous;weight=0;phase="ROLLED_BACK";log("Manual rollback complete. Stable restored to "+stable+".");}
 case "reset" -> {phase="READY";stable=previous="v1.0.0";candidate="v1.1.0";weight=stableHits=canaryHits=failures=batch=0;faulty=false;events.clear();log("Lab reset to its initial state.");}
 default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Unknown lab action.");
 }return snapshot();
 }
}
