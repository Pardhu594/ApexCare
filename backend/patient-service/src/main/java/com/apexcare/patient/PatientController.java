package com.apexcare.patient;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientRepository repo;

    public PatientController(PatientRepository repo) {
        this.repo = repo;
    }

    public static class PatientRequest {

        @NotBlank
        @Size(max = 120)
        private String name;

        @Min(0)
        @Max(120)
        private Integer age;

        private String gender;
        private String phone;
        private String email;
        private String bloodGroup;
        private String conditionName;

        public PatientRequest() {}

        public String name() {
            return name;
        }

        public Integer age() {
            return age;
        }

        public String gender() {
            return gender;
        }

        public String phone() {
            return phone;
        }

        public String email() {
            return email;
        }

        public String bloodGroup() {
            return bloodGroup;
        }

        public String conditionName() {
            return conditionName;
        }

        public void setName(String name) {
            this.name = name;
        }

        public void setAge(Integer age) {
            this.age = age;
        }

        public void setGender(String gender) {
            this.gender = gender;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public void setBloodGroup(String bloodGroup) {
            this.bloodGroup = bloodGroup;
        }

        public void setConditionName(String conditionName) {
            this.conditionName = conditionName;
        }
    }

    @GetMapping
    public List<Patient> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody PatientRequest r) {
        Patient patient = new Patient(
                r.name(),
                r.age(),
                r.gender(),
                r.phone(),
                r.email(),
                r.bloodGroup(),
                r.conditionName()
        );

        return ResponseEntity.status(201).body(repo.save(patient));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequest r) {

        return repo.findById(id)
                .<ResponseEntity<?>>map(p -> {
                    p.update(
                            r.name(),
                            r.age(),
                            r.gender(),
                            r.phone(),
                            r.email(),
                            r.bloodGroup(),
                            r.conditionName()
                    );

                    return ResponseEntity.ok(repo.save(p));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
