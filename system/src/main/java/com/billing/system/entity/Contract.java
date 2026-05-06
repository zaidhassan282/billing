package com.billing.system.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;


@Setter
@Getter
@Entity
@Table(name = "contract_table")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dated;

    private String contractNo;

    private String partyCode;

    private String nameOfParty;

    private String gstInvoice;

    private String hsCode;

    private String quality;

    private Double weight;

    private Double rateA;

    private Double rateB; // 🔥 NEW FIELD

    private Double shrinkageAllowed;

    private String deliveryTime;

    private String paymentTerm;

    private String remarks;

}