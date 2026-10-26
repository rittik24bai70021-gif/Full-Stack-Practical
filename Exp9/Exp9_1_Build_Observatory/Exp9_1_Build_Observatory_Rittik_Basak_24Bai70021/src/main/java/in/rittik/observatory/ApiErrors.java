package in.rittik.observatory;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import java.util.Map;
@RestControllerAdvice
public class ApiErrors {
 @ExceptionHandler(IllegalArgumentException.class)
 ResponseEntity<?> invalid(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));}
 @ExceptionHandler(ResponseStatusException.class)
 ResponseEntity<?> missing(ResponseStatusException e){return ResponseEntity.status(e.getStatusCode()).body(Map.of("message",e.getReason()==null?"Request failed":e.getReason()));}
 @ExceptionHandler(HttpMessageNotReadableException.class)
 ResponseEntity<?> malformed(){return ResponseEntity.badRequest().body(Map.of("message","Send a JSON object with a commitMessage field"));}
}
