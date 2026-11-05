package com.apexcare.patient;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/internal/patients")
public class InternalPatientController {

    private final PatientRepository repo;

    public InternalPatientController(PatientRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/{id}/exists")
    public Map<String, Boolean> exists(@PathVariable("id") Long id) {
        return Map.of("exists", repo.existsById(id));
    }
}