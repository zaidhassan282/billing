package com.billing.system.dto;

public class IssueRequest {

    private String inwardGatePassNo;
    private String quality;
    private String color;
    private Double qtyKg;

    public String getInwardGatePassNo() {
        return inwardGatePassNo;
    }

    public void setInwardGatePassNo(String inwardGatePassNo) {
        this.inwardGatePassNo = inwardGatePassNo;
    }

    public String getQuality() {
        return quality;
    }

    public void setQuality(String quality) {
        this.quality = quality;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Double getQtyKg() {
        return qtyKg;
    }

    public void setQtyKg(Double qtyKg) {
        this.qtyKg = qtyKg;
    }
}