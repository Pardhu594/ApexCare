package com.apexcare.appointment;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity @Table(name="appointments")
public class Appointment {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private Long patientId;
 @Column(nullable=false,length=120) private String patientName;
 @Column(nullable=false,length=120) private String doctorName;
 @Column(nullable=false,length=80) private String department;
 @Column(nullable=false) private LocalDate appointmentDate;
 @Column(nullable=false,length=20) private String appointmentTime;
 @Column(nullable=false,length=24) private String status="SCHEDULED";
 @Column(length=250) private String reason;
 private LocalDateTime createdAt=LocalDateTime.now();
 protected Appointment(){}
 public Appointment(Long patientId,String patientName,String doctorName,String department,LocalDate appointmentDate,String appointmentTime,String status,String reason){this.patientId=patientId;this.patientName=patientName;this.doctorName=doctorName;this.department=department;this.appointmentDate=appointmentDate;this.appointmentTime=appointmentTime;this.status=status==null||status.isBlank()?"SCHEDULED":status.toUpperCase();this.reason=reason;}
 public Long getId(){return id;} public Long getPatientId(){return patientId;} public String getPatientName(){return patientName;} public String getDoctorName(){return doctorName;} public String getDepartment(){return department;} public LocalDate getAppointmentDate(){return appointmentDate;} public String getAppointmentTime(){return appointmentTime;} public String getStatus(){return status;} public String getReason(){return reason;} public LocalDateTime getCreatedAt(){return createdAt;}
 public void setStatus(String status){this.status=status.toUpperCase();}
}
