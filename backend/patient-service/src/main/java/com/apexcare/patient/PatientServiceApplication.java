package com.apexcare.patient;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
    @SpringBootApplication(scanBasePackages="com.apexcare")
public class PatientServiceApplication {
  public static void main(String[] args) { SpringApplication.run(PatientServiceApplication.class,args); }
}
