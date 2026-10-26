package in.rittik.observatory;
import au.com.dius.pact.provider.junit5.*;
import au.com.dius.pact.provider.junitsupport.*;
import au.com.dius.pact.provider.junitsupport.loader.PactFolder;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
@Provider("BuildObservatoryAPI") @PactFolder("target/pacts")
class BuildProviderIT {
 @LocalServerPort int port;
 @Autowired BuildRunRepository repository;
 @BeforeEach void target(PactVerificationContext context){context.setTarget(new HttpTestTarget("localhost",port));}
 @State("no build records") void empty(){repository.deleteAll();}
 @TestTemplate @ExtendWith(PactVerificationInvocationContextProvider.class)
 void contract(PactVerificationContext context){context.verifyInteraction();}
}
