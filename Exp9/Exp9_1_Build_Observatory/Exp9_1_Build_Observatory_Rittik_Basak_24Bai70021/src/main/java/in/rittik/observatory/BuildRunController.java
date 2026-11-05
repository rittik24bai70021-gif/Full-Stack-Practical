package in.rittik.observatory;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.net.URI;
import java.util.List;
@RestController @RequestMapping("/api/builds")
public class BuildRunController {
 private final BuildRunService service;
 public BuildRunController(BuildRunService service){this.service=service;}
 public record CreateBuildRequest(String commitMessage) {}
 @PostMapping public ResponseEntity<BuildRun> create(@RequestBody CreateBuildRequest request){
  BuildRun run=service.createBuild(request.commitMessage());
  return ResponseEntity.created(URI.create("/api/builds/"+run.getId())).body(run);
 }
 @GetMapping public List<BuildRun> list(){return service.getBuilds();}
 @GetMapping("/{id}") public BuildRun get(@PathVariable long id){return service.getBuild(id);}
}
