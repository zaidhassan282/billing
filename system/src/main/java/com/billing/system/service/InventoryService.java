package com.billing.system.service;

import com.billing.system.entity.Inventory;
import com.billing.system.repository.InventoryRepository;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepo;

    // ✅ Constructor Injection (no @Autowired field injection)
    public InventoryService(InventoryRepository inventoryRepo) {
        this.inventoryRepo = inventoryRepo;
    }

    // ✅ ISSUE STOCK (used for Dyeing / Internal usage)
    public void issueStock(String quality, String color, Double qty) {

        if (quality == null || quality.isEmpty()) {
            throw new RuntimeException("Quality is required");
        }

        if (qty == null || qty <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        if (color == null) {
            color = "NA";
        }

        String finalColor = color;
        Inventory inv = inventoryRepo
                .findByQualityAndColor(quality, color)
                .orElseThrow(() -> new RuntimeException(
                        "Stock not found for " + quality + " - " + finalColor
                ));

        if (inv.getAvailableKg() < qty) {
            throw new RuntimeException(
                    "Not enough stock. Available: " + inv.getAvailableKg()
            );
        }

        inv.setAvailableKg(inv.getAvailableKg() - qty);

        inventoryRepo.save(inv);
    }

    // ✅ RETURN STOCK (used for returns or adjustments)
    public void returnStock(String quality, String color, Double qty) {

        if (quality == null || quality.isEmpty()) {
            throw new RuntimeException("Quality is required");
        }

        if (qty == null || qty <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        if (color == null) {
            color = "NA";
        }

        Inventory inv = inventoryRepo
                .findByQualityAndColor(quality, color)
                .orElse(null);

        // 🔥 If not exist → create new stock
        if (inv == null) {
            inv = new Inventory();
            inv.setQuality(quality);
            inv.setColor(color);
            inv.setAvailableKg(qty);
        } else {
            inv.setAvailableKg(inv.getAvailableKg() + qty);
        }

        inventoryRepo.save(inv);
    }
}