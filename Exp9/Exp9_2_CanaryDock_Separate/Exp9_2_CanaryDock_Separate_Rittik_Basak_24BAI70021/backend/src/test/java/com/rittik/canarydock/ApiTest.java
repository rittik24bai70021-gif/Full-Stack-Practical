package com.rittik.canarydock;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc
class ApiTest {
 @Autowired MockMvc mvc;
 @Test void healthAndIdentity() throws Exception {
 mvc.perform(get("/actuator/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
 mvc.perform(get("/api/info")).andExpect(jsonPath("$.uid").value("24BAI70021"));
 mvc.perform(get("/api/hello")).andExpect(header().string("X-Release-Slot","local"));
}
 @Test void invalidAction() throws Exception {mvc.perform(post("/api/lab").contentType("application/json").content("{}")).andExpect(status().isBadRequest());}
}
