package com.apexcare.billing;

import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/billing")
public class BillingController {

    private final InvoiceRepository repo;
    private final RestTemplate rest;

    public BillingController(InvoiceRepository repo, RestTemplate rest) {
        this.repo = repo;
        this.rest = rest;
    }

    public static class InvoiceRequest {

        @NotNull
        private Long patientId;

        @NotBlank
        private String patientName;

        @NotBlank
        private String serviceName;

        @NotNull
        @Positive
        private Long amountPaise;

        private String status;

        public InvoiceRequest() {
        }

        public Long getPatientId() {
            return patientId;
        }

        public void setPatientId(Long patientId) {
            this.patientId = patientId;
        }

        public String getPatientName() {
            return patientName;
        }

        public void setPatientName(String patientName) {
            this.patientName = patientName;
        }

        public String getServiceName() {
            return serviceName;
        }

        public void setServiceName(String serviceName) {
            this.serviceName = serviceName;
        }

        public Long getAmountPaise() {
            return amountPaise;
        }

        public void setAmountPaise(Long amountPaise) {
            this.amountPaise = amountPaise;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    @GetMapping
    public List<Invoice> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable("id") Long id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(
            @jakarta.validation.Valid @RequestBody InvoiceRequest r) {

        try {
            Map<?, ?> result = rest.getForObject(
                    "http://patient-service/internal/patients/"
                            + r.getPatientId() + "/exists",
                    Map.class);

            if (result == null
                    || !Boolean.TRUE.equals(result.get("exists"))) {
                return ResponseEntity.badRequest().body(
                        Map.of("error",
                                "Patient ID does not exist. Register the patient first."));
            }

        } catch (Exception ex) {
            return ResponseEntity.status(503).body(
                    Map.of("error",
                            "Patient service is not available. Please retry."));
        }

        Invoice invoice = new Invoice(
                r.getPatientId(),
                r.getPatientName(),
                r.getServiceName(),
                r.getAmountPaise(),
                r.getStatus());

        return ResponseEntity.status(201).body(repo.save(invoice));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> status(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body) {

        String s = body.getOrDefault("status", "").toUpperCase();

        if (!Set.of("PENDING", "PAID", "OVERDUE").contains(s)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Unsupported status"));
        }

        return repo.findById(id)
                .<ResponseEntity<?>>map(i -> {
                    i.setStatus(s);
                    return ResponseEntity.ok(repo.save(i));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}


