package com.apexcare.appointment;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
    @SpringBootApplication(scanBasePackages="com.apexcare")
public class AppointmentServiceApplication {
  public static void main(String[] args) { SpringApplication.run(AppointmentServiceApplication.class,args); }
}
