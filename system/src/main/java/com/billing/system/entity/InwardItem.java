package com.billing.system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonBackReference;
@Getter
@Setter
@Entity
public class InwardItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description; // Quality
    private String color;
    private String design;
    private Integer rolls;
    private Double weightKg;
    private Double meters;
    private String remarks;

    @ManyToOne
    @JoinColumn(name = "inward_id")
    private InwardGatePass inward;

    // getters/setters
}