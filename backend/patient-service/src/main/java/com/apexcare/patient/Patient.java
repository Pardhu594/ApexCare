package com.apexcare.patient;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity @Table(name="patients")
public class Patient {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=120) private String name;
 private Integer age;
 @Column(length=30) private String gender;
 @Column(length=30) private String phone;
 @Column(length=180) private String email;
 @Column(length=8) private String bloodGroup;
 @Column(length=180) private String conditionName;
 private LocalDate registeredDate=LocalDate.now();
 protected Patient(){}
 public Patient(String name,Integer age,String gender,String phone,String email,String bloodGroup,String conditionName){this.name=name;this.age=age;this.gender=gender;this.phone=phone;this.email=email;this.bloodGroup=bloodGroup;this.conditionName=conditionName;}
 public Long getId(){return id;} public String getName(){return name;} public Integer getAge(){return age;} public String getGender(){return gender;} public String getPhone(){return phone;} public String getEmail(){return email;} public String getBloodGroup(){return bloodGroup;} public String getConditionName(){return conditionName;} public LocalDate getRegisteredDate(){return registeredDate;}
 public void update(String name,Integer age,String gender,String phone,String email,String bloodGroup,String conditionName){this.name=name;this.age=age;this.gender=gender;this.phone=phone;this.email=email;this.bloodGroup=bloodGroup;this.conditionName=conditionName;}
}
