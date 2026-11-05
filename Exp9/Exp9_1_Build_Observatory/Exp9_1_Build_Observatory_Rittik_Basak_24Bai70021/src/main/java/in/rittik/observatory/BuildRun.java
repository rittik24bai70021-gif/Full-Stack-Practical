package in.rittik.observatory;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="build_runs")
public class BuildRun {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=200) private String commitMessage;
 @Column(nullable=false) private String status="QUEUED";
 @Column(nullable=false,updatable=false) private Instant createdAt;
 protected BuildRun() {}
 public BuildRun(String commitMessage) { this.commitMessage=commitMessage; this.createdAt=Instant.now(); }
 public Long getId(){return id;}
 public String getCommitMessage(){return commitMessage;}
 public String getStatus(){return status;}
 public Instant getCreatedAt(){return createdAt;}
}
