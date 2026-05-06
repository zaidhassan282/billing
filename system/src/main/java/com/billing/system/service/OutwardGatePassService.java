package com.billing.system.service;

import com.billing.system.entity.Inventory;
import com.billing.system.entity.OutwardGatePass;
import com.billing.system.entity.OutwardItem;
import com.billing.system.repository.InventoryRepository;
import com.billing.system.repository.OutwardGatePassRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class OutwardGatePassService {

    private final OutwardGatePassRepository outwardRepo;
    private final InventoryRepository inventoryRepo;

    // ✅ Constructor Injection
    public OutwardGatePassService(
            OutwardGatePassRepository outwardRepo,
            InventoryRepository inventoryRepo
    ) {
        this.outwardRepo = outwardRepo;
        this.inventoryRepo = inventoryRepo;
    }

    // ✅ SAVE OUTWARD
    public OutwardGatePass save(OutwardGatePass outward) {

        // ✅ Gate Pass No
        if (outward.getGatePassNo() == null || outward.getGatePassNo().isEmpty()) {
            outward.setGatePassNo("OUT-" + UUID.randomUUID().toString().substring(0, 6));
        }

        // ✅ Date
        if (outward.getDate() == null) {
            outward.setDate(LocalDate.now());
        }

        // ❌ Validation - items required
        if (outward.getItems() == null || outward.getItems().isEmpty()) {
            throw new RuntimeException("At least one item is required");
        }

        // ❌ Validation - customer required
        if (outward.getCustomerName() == null || outward.getCustomerName().isEmpty()) {
            throw new RuntimeException("Customer name is required");
        }

        // 🔥 Process Items
        for (OutwardItem item : outward.getItems()) {

            item.setOutward(outward);

            // ❌ Validation
            if (item.getDescription() == null || item.getDescription().isEmpty()) {
                throw new RuntimeException("Quality/Description is required");
            }

            if (item.getWeightKg() == null || item.getWeightKg() <= 0) {
                throw new RuntimeException("Weight must be greater than 0");
            }

            if (item.getColor() == null) {
                item.setColor("NA");
            }

            // 🔥 FIND INVENTORY
            Inventory inv = inventoryRepo
                    .findByQualityAndColor(item.getDescription(), item.getColor())
                    .orElseThrow(() -> new RuntimeException(
                            "Stock not found for " + item.getDescription() + " - " + item.getColor()
                    ));

            // 🔥 CHECK STOCK
            if (inv.getAvailableKg() < item.getWeightKg()) {
                throw new RuntimeException(
                        "Not enough stock for " + item.getDescription() +
                                ". Available: " + inv.getAvailableKg()
                );
            }

            // 🔥 REDUCE STOCK
            inv.setAvailableKg(inv.getAvailableKg() - item.getWeightKg());

            inventoryRepo.save(inv);
        }

        return outwardRepo.save(outward);
    }

    // ✅ GET ALL
    public List<OutwardGatePass> getAll() {
        return outwardRepo.findAll();
    }
}