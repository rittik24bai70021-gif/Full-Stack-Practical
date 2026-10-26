package com.rittik.streamops;
import jakarta.validation.constraints.*;
public record EventRequest(
 @NotBlank @Pattern(regexp="[A-Za-z0-9_-]{1,80}", message="Use 1-80 letters, numbers, underscores or hyphens") String eventId,
 @NotBlank @Size(max=2000) String content,
 @Min(0) @Max(100) int failuresBeforeSuccess) {}
