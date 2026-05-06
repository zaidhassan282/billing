package com.billing.system.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.List;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@Entity
public class OutwardGatePass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String gatePassNo;

    private LocalDate date;

    private String customerName;
    private String address;
    private String vehicleNo;
    private String driverName;
    private String referenceNo;

    private String fabricType; // DYED / GREY

    @OneToMany(mappedBy = "outward", cascade = CascadeType.ALL)
    private List<OutwardItem> items;
}