package com.billing.system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gatePassNo;   // ✅ replace inwardId
    private String quality;
    private String color;

    private Double availableKg;
    private Double availableMeters;
}