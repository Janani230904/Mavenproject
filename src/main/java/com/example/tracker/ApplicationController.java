package com.example.tracker;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    private final ApplicationRepository repository;

    public ApplicationController(ApplicationRepository repository) {
        this.repository = repository;
    }

    public record ApplicationRequest(
        @NotBlank @Size(max = 100) String company,
        @NotBlank @Size(max = 100) String role,
        @NotNull JobApplication.Status status
    ) {}

    @GetMapping
    public List<JobApplication> list() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplication create(@Valid @RequestBody ApplicationRequest input) {
        return repository.save(new JobApplication(input.company(), input.role(), input.status()));
    }

    @PutMapping("/{id}")
    @Transactional
    public JobApplication update(@PathVariable long id, @Valid @RequestBody ApplicationRequest input) {
        JobApplication application = find(id);
        application.update(input.company(), input.role(), input.status());
        return application;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable long id) {
        repository.delete(find(id));
    }

    private JobApplication find(long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
