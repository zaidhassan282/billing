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

    // Reference back to the source document (IGP-xxx, DR-xxx, etc.)
    private String refId;

    // GREIGH or DYED — used by the frontend Inventory page tabs
    private String stage;

    private String quality;

    private String color;

    private Double availableKg;

    private Double availableMeters;
}
