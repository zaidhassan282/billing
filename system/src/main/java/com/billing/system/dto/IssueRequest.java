package com.billing.system.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IssueRequest {

    // Frontend sends `inwardId`; older callers may send `inwardGatePassNo`.
    private String inwardId;
    private String inwardGatePassNo;

    private String quality;
    private String color;
    private Double qtyKg;

    public String resolveInwardRef() {
        return inwardId != null && !inwardId.isEmpty() ? inwardId : inwardGatePassNo;
    }
}
