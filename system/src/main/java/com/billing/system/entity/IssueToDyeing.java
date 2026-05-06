package com.billing.system.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
public class IssueToDyeing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String issueId; // DY-xxxx

    private String inwardGatePassNo;

    private String quality;

    private String color;

    private Double quantityKg;

    private LocalDate date;


}