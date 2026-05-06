package com.billing.system.service;

import com.billing.system.entity.Inventory;
import com.billing.system.enums.FabricStage;
import com.billing.system.repository.InventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepo;

    public InventoryService(InventoryRepository inventoryRepo) {
        this.inventoryRepo = inventoryRepo;
    }

    @Transactional
    public void issueStock(String quality, String color, Double qty) {
        if (quality == null || quality.isEmpty()) {
            throw new RuntimeException("Quality is required");
        }
        if (qty == null || qty <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }
        String resolvedColor = (color == null || color.isEmpty()) ? "NA" : color;

        Inventory inv = inventoryRepo
                .findByQualityAndColorAndStage(quality, resolvedColor, FabricStage.GREIGH.name())
                .orElseThrow(() -> new RuntimeException(
                        "Greige stock not found for " + quality + " - " + resolvedColor));

        if (inv.getAvailableKg() == null || inv.getAvailableKg() < qty) {
            throw new RuntimeException("Not enough stock. Available: " + inv.getAvailableKg());
        }

        inv.setAvailableKg(inv.getAvailableKg() - qty);
        inventoryRepo.save(inv);
    }

    @Transactional
    public void returnStock(String quality, String color, Double qty) {
        if (quality == null || quality.isEmpty()) {
            throw new RuntimeException("Quality is required");
        }
        if (qty == null || qty <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }
        String resolvedColor = (color == null || color.isEmpty()) ? "NA" : color;

        Inventory inv = inventoryRepo
                .findByQualityAndColorAndStage(quality, resolvedColor, FabricStage.GREIGH.name())
                .orElse(null);

        if (inv == null) {
            inv = new Inventory();
            inv.setStage(FabricStage.GREIGH.name());
            inv.setQuality(quality);
            inv.setColor(resolvedColor);
            inv.setAvailableKg(qty);
            inv.setAvailableMeters(0.0);
        } else {
            inv.setAvailableKg((inv.getAvailableKg() == null ? 0.0 : inv.getAvailableKg()) + qty);
        }

        inventoryRepo.save(inv);
    }
}
