package com.apexcare.billing;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
    @SpringBootApplication(scanBasePackages="com.apexcare")
public class BillingServiceApplication {
  public static void main(String[] args) { SpringApplication.run(BillingServiceApplication.class,args); }
}
