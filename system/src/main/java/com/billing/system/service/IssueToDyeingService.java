package com.billing.system.service;

import com.billing.system.entity.Inventory;
import com.billing.system.entity.IssueToDyeing;
import com.billing.system.repository.InventoryRepository;
import com.billing.system.repository.IssueToDyeingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class IssueToDyeingService {

    private final InventoryRepository inventoryRepo;
    private final IssueToDyeingRepository issueRepo;

    public IssueToDyeingService(
            InventoryRepository inventoryRepo,
            IssueToDyeingRepository issueRepo
    ) {
        this.inventoryRepo = inventoryRepo;
        this.issueRepo = issueRepo;
    }

    public IssueToDyeing issue(String quality, String color, Double qty, String inwardGatePassNo) {

        // ✅ Validation
        if (quality == null || quality.isEmpty()) {
            throw new RuntimeException("Quality is required");
        }

        if (qty == null || qty <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        if (color == null) color = "NA";

        // 🔥 GET INVENTORY
        Inventory inv = inventoryRepo
                .findByQualityAndColor(quality, color)
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        if (inv.getAvailableKg() < qty) {
            throw new RuntimeException("Not enough stock. Available: " + inv.getAvailableKg());
        }

        // 🔥 REDUCE STOCK
        inv.setAvailableKg(inv.getAvailableKg() - qty);
        inventoryRepo.save(inv);

        // 🔥 SAVE RECORD
        IssueToDyeing record = new IssueToDyeing();
        record.setIssueId("DY-" + UUID.randomUUID().toString().substring(0,6));
        record.setQuality(quality);
        record.setColor(color);
        record.setQuantityKg(qty);
        record.setDate(LocalDate.now());
        record.setInwardGatePassNo(inwardGatePassNo);

        return issueRepo.save(record);
    }
}