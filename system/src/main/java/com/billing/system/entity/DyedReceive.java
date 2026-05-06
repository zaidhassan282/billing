package com.billing.system.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;


@Setter
@Getter
@Entity
public class DyedReceive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dated;

    private String inwardGatePassNo;

    private String contractNo;

    private String partyCode;

    private String nameOfParty;

    private String customerLotNo;

    private String factoryLotNo;

    private String quality;

    private Double quantityKg;

    private Double cutPiecesKg;

    private Double shrinkage;

    @Column(unique = true)
    private String newId;

    // getters & setters
}