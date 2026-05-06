package com.billing.system.service;

import com.billing.system.entity.*;
import com.billing.system.repository.ContractRepository;
import com.billing.system.repository.InwardGatePassRepository;
import com.billing.system.repository.InventoryRepository;
import com.billing.system.repository.FabricMovementRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class InwardService {

    private final InwardGatePassRepository inwardRepo;
    private final ContractRepository contractRepo;
    private final InventoryRepository inventoryRepo;
    private final FabricMovementRepository movementRepo;

    // ✅ Constructor Injection
    public InwardService(
            InwardGatePassRepository inwardRepo,
            ContractRepository contractRepo,
            InventoryRepository inventoryRepo,
            FabricMovementRepository movementRepo
    ) {
        this.inwardRepo = inwardRepo;
        this.contractRepo = contractRepo;
        this.inventoryRepo = inventoryRepo;
        this.movementRepo = movementRepo;
    }

    // ✅ SAVE INWARD
    public InwardGatePass save(InwardGatePass inward) {

        // ✅ Gate Pass No
        if (inward.getGatePassNo() == null || inward.getGatePassNo().isEmpty()) {
            inward.setGatePassNo("IN-" + UUID.randomUUID().toString().substring(0, 6));
        }

        // ✅ Date
        if (inward.getDate() == null) {
            inward.setDate(LocalDate.now());
        }

        // ❌ Prevent null items
        if (inward.getItems() == null || inward.getItems().isEmpty()) {
            throw new RuntimeException("At least one item is required");
        }

        // 🔥 Process Items
        for (InwardItem item : inward.getItems()) {

            item.setInward(inward);

            // ❌ Validation
            if (item.getDescription() == null || item.getDescription().isEmpty()) {
                throw new RuntimeException("Quality/Description is required");
            }

            if (item.getWeightKg() == null || item.getWeightKg() <= 0) {
                throw new RuntimeException("Weight must be greater than 0");
            }

            if (item.getColor() == null) {
                item.setColor("NA"); // optional fallback
            }

            if (item.getMeters() == null) item.setMeters(0.0);

            // 🔥 INVENTORY LOGIC (MERGE, NOT CREATE ALWAYS)
            Inventory inv = inventoryRepo
                    .findByQualityAndColor(item.getDescription(), item.getColor())
                    .orElse(null);

            if (inv == null) {
                inv = new Inventory();
                inv.setQuality(item.getDescription());
                inv.setColor(item.getColor());
                inv.setAvailableKg(item.getWeightKg());
                inv.setAvailableMeters(item.getMeters());
            } else {
                inv.setAvailableKg(inv.getAvailableKg() + item.getWeightKg());
                inv.setAvailableMeters(inv.getAvailableMeters() + item.getMeters());
            }

            inventoryRepo.save(inv);

            // 🔥 (Optional - keep or remove for now)
            // FabricMovement tracking (you can comment this if not ready)
            /*
            FabricMovement movement = new FabricMovement();
            movement.setRefId(inward.getGatePassNo());
            movement.setQuality(item.getDescription());
            movement.setQuantityKg(item.getWeightKg());
            movement.setType(MovementType.INWARD);
            movement.setFromStage(null);
            movement.setToStage(FabricStage.GREIGH);
            movement.setDated(LocalDate.now());

            movementRepo.save(movement);
            */
        }

        return inwardRepo.save(inward);
    }

    // ✅ GET ALL
    public List<InwardGatePass> getAll() {
        return inwardRepo.findAll();
    }

    // ✅ GET BY GATE PASS NO (UPDATED)
    public InwardGatePass getByGatePassNo(String gatePassNo) {
        return inwardRepo.findByGatePassNo(gatePassNo)
                .orElseThrow(() -> new RuntimeException("Inward not found: " + gatePassNo));
    }
}