package com.billing.system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Getter
@Setter
@Entity
public class InwardGatePass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String gatePassNo;

    private LocalDate date;

    // Party Details
    private String supplierName;
    private String address;
    private String vehicleNo;
    private String driverName;
    private String referenceNo;

    // Fabric Type
    private String fabricType; // DYED / GREY

    @OneToMany(mappedBy = "inward", cascade = CascadeType.ALL)
    private List<InwardItem> items;

}