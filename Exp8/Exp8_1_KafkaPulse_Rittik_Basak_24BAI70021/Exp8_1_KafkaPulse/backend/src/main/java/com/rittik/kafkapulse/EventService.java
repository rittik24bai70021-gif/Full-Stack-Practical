package com.rittik.kafkapulse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;
@Service
public class EventService {
 private final EventRepository repo; private final KafkaTemplate<String,String> kafka; private final ObjectMapper json;
 public EventService(EventRepository repo,KafkaTemplate<String,String> kafka,ObjectMapper json){this.repo=repo;this.kafka=kafka;this.json=json;}
 // One service instance serializes duplicate checks and state transitions for this lab.
 public synchronized EventRecord submit(EventRequest request){
  if(repo.existsById(request.eventId())) throw new ResponseStatusException(HttpStatus.CONFLICT,"Event ID already exists. Use a new ID; duplicate submissions are blocked.");
  EventRecord row=repo.saveAndFlush(new EventRecord(request.eventId(),request.content().strip(),request.failuresBeforeSuccess()));
  try { kafka.send(KafkaConfig.MAIN,row.eventId,json.writeValueAsString(request)).get(20,TimeUnit.SECONDS); }
  catch(Exception ex){
   if(ex instanceof InterruptedException) Thread.currentThread().interrupt();
   row.status="PUBLISH_FAILED";row.lastError="Broker acknowledgement not received. Delivery may be uncertain; inspect this ID before submitting another.";row.updatedAt=Instant.now();repo.saveAndFlush(row);
   throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,row.lastError);
  }
  return row;
 }
 public List<EventRecord> list(){return repo.findAllByOrderByCreatedAtDesc();}
 public EventRecord get(String id){return repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Event not found"));}
 public synchronized void process(String id){
  EventRecord row=get(id);
  if(row.status.equals("PROCESSED")||row.status.equals("DLQ"))return;
  row.attempts++;row.status="PROCESSING";row.updatedAt=Instant.now();repo.saveAndFlush(row);
  if(row.attempts<=row.failuresBeforeSuccess){
   row.status="RETRYING";row.lastError="Simulated transient failure on attempt "+row.attempts;row.updatedAt=Instant.now();repo.saveAndFlush(row);
   // This exception is intentionally outside any enclosing transaction: attempts stay persisted.
   throw new IllegalStateException(row.lastError);
  }
  row.status="PROCESSED";row.lastError=null;row.updatedAt=Instant.now();repo.saveAndFlush(row);
 }
 public synchronized void deadLetter(String id){EventRecord row=get(id);if(row.status.equals("PROCESSED"))return;row.status="DLQ";row.updatedAt=Instant.now();repo.saveAndFlush(row);}
}
