package com.apexcare.billing;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity @Table(name="invoices")
public class Invoice {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private Long patientId;
 @Column(nullable=false,length=120) private String patientName;
 @Column(nullable=false,length=120) private String serviceName;
 @Column(nullable=false) private Long amountPaise;
 @Column(nullable=false,length=20) private String status="PENDING";
 @Column(nullable=false) private LocalDate invoiceDate=LocalDate.now();
 protected Invoice(){}
 public Invoice(Long patientId,String patientName,String serviceName,Long amountPaise,String status){this.patientId=patientId;this.patientName=patientName;this.serviceName=serviceName;this.amountPaise=amountPaise;this.status=status==null||status.isBlank()?"PENDING":status.toUpperCase();}
 public Long getId(){return id;}public Long getPatientId(){return patientId;}public String getPatientName(){return patientName;}public String getServiceName(){return serviceName;}public Long getAmountPaise(){return amountPaise;}public String getStatus(){return status;}public LocalDate getInvoiceDate(){return invoiceDate;}public void setStatus(String s){status=s.toUpperCase();}
}
