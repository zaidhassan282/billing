package com.billing.system.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;


@Setter
@Getter
@Entity
public class OutwardItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private String color;
    private Double weightKg;
    private Double meters;

    @ManyToOne
    @JoinColumn(name = "outward_id")
    private OutwardGatePass outward;

}