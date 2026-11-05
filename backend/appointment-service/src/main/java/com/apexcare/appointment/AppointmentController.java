
package com.apexcare.appointment;

import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentRepository repo;
    private final RestTemplate rest;

    public AppointmentController(AppointmentRepository repo, RestTemplate rest) {
        this.repo = repo;
        this.rest = rest;
    }

    public static class AppointmentRequest {
        @NotNull
        private Long patientId;
        @NotBlank
        private String patientName;
        @NotBlank
        private String doctorName;
        @NotBlank
        private String department;
        @NotNull
        private LocalDate appointmentDate;
        @NotBlank
        private String appointmentTime;
        private String status;
        private String reason;

        public AppointmentRequest() {}

        public Long getPatientId() { return patientId; }
        public void setPatientId(Long v) { patientId = v; }

        public String getPatientName() { return patientName; }
        public void setPatientName(String v) { patientName = v; }

        public String getDoctorName() { return doctorName; }
        public void setDoctorName(String v) { doctorName = v; }

        public String getDepartment() { return department; }
        public void setDepartment(String v) { department = v; }

        public LocalDate getAppointmentDate() { return appointmentDate; }
        public void setAppointmentDate(LocalDate v) { appointmentDate = v; }

        public String getAppointmentTime() { return appointmentTime; }
        public void setAppointmentTime(String v) { appointmentTime = v; }

        public String getStatus() { return status; }
        public void setStatus(String v) { status = v; }

        public String getReason() { return reason; }
        public void setReason(String v) { reason = v; }
    }

    @GetMapping
    public List<Appointment> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(
            @jakarta.validation.Valid @RequestBody AppointmentRequest r) {
        try {
            Map<?, ?> result = rest.getForObject(
                    "http://patient-service/internal/patients/"
                            + r.getPatientId() + "/exists",
                    Map.class);

            if (result == null || !Boolean.TRUE.equals(result.get("exists"))) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Patient ID does not exist. Register the patient first."));
            }
        } catch (Exception ex) {
            return ResponseEntity.status(503).body(
                    Map.of("error", "Patient service is not available. Please retry."));
        }

        Appointment appointment = new Appointment(
                r.getPatientId(),
                r.getPatientName(),
                r.getDoctorName(),
                r.getDepartment(),
                r.getAppointmentDate(),
                r.getAppointmentTime(),
                r.getStatus(),
                r.getReason());

        return ResponseEntity.status(201).body(repo.save(appointment));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> status(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String s = body.getOrDefault("status", "").toUpperCase();

        if (!Set.of("SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED").contains(s)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unsupported status"));
        }

        return repo.findById(id)
                .<ResponseEntity<?>>map(a -> {
                    a.setStatus(s);
                    return ResponseEntity.ok(repo.save(a));
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
