package com.rittik.streamops;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.kafka.core.KafkaTemplate;
import java.time.Duration;
import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:reliability;DB_CLOSE_DELAY=-1","spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
@EmbeddedKafka(partitions=1,topics={"scheduled-posts-82","scheduled-posts-dlq-82"},bootstrapServersProperty="spring.kafka.bootstrap-servers")
@DirtiesContext
class ReliabilityTest {
 @Autowired MockMvc mvc;
 @Autowired EventRepository repo;
 @Autowired KafkaTemplate<String,String> kafka;
 String payload(String id,int failures){return "{\"eventId\":\""+id+"\",\"content\":\"Integration check\",\"failuresBeforeSuccess\":"+failures+"}";}
 void submit(String id,int failures) throws Exception {mvc.perform(post("/api/events").contentType("application/json").content(payload(id,failures))).andExpect(status().isAccepted());}
 void check(String id,String status,int attempts){await().atMost(Duration.ofSeconds(40)).untilAsserted(()->{EventRecord e=repo.findById(id).orElseThrow();assertEquals(status,e.status);assertEquals(attempts,e.attempts);});}
 @Test void verifiesRealBrokerLifecycleAndApi() throws Exception {
  submit("TEST-NORMAL",0);check("TEST-NORMAL","PROCESSED",1);
  submit("TEST-RETRY",2);check("TEST-RETRY","PROCESSED",3);
  submit("TEST-DLQ",10);check("TEST-DLQ","DLQ",4);
  mvc.perform(post("/api/events").contentType("application/json").content(payload("TEST-NORMAL",0))).andExpect(status().isConflict());
  kafka.send(KafkaConfig.MAIN,"TEST-NORMAL",payload("TEST-NORMAL",0)).get();
  // Send a following marker on the same partition, then wait for it to prove the duplicate was consumed.
  submit("TEST-MARKER",0);check("TEST-MARKER","PROCESSED",1);
  assertEquals(1,repo.findById("TEST-NORMAL").orElseThrow().attempts);
  mvc.perform(get("/api/events/TEST-DLQ")).andExpect(status().isOk()).andExpect(jsonPath("$.attempts").value(4));
  mvc.perform(get("/api/events/missing")).andExpect(status().isNotFound());
  mvc.perform(post("/api/events").contentType("application/json").content(payload("BAD",-1))).andExpect(status().isBadRequest());
  mvc.perform(get("/api/health")).andExpect(status().isOk()).andExpect(jsonPath("$.kafka").value("UP"));
 }
}
