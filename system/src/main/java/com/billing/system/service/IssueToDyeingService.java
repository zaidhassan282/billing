package com.billing.system.service;

import com.billing.system.entity.FabricMovement;
import com.billing.system.entity.Inventory;
import com.billing.system.entity.IssueToDyeing;
import com.billing.system.enums.FabricStage;
import com.billing.system.enums.MovementType;
import com.billing.system.repository.FabricMovementRepository;
import com.billing.system.repository.InventoryRepository;
import com.billing.system.repository.IssueToDyeingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class IssueToDyeingService {

    private final InventoryRepository inventoryRepo;
    private final IssueToDyeingRepository issueRepo;
    private final FabricMovementRepository movementRepo;

    public IssueToDyeingService(InventoryRepository inventoryRepo,
                                IssueToDyeingRepository issueRepo,
                                FabricMovementRepository movementRepo) {
        this.inventoryRepo = inventoryRepo;
        this.issueRepo = issueRepo;
        this.movementRepo = movementRepo;
    }

    @Transactional
    public IssueToDyeing issue(String quality, String color, Double qty, String inwardId) {

        if (quality == null || quality.isEmpty()) {
            throw new RuntimeException("Quality is required");
        }
        if (qty == null || qty <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        String resolvedColor = (color == null || color.isEmpty()) ? null : color;
        Inventory inv = findGreigeInventory(quality, resolvedColor);

        if (inv.getAvailableKg() == null || inv.getAvailableKg() < qty) {
            throw new RuntimeException("Not enough greige stock for "
                    + quality + ". Available: " + inv.getAvailableKg());
        }

        inv.setAvailableKg(inv.getAvailableKg() - qty);
        inventoryRepo.save(inv);

        IssueToDyeing record = new IssueToDyeing();
        record.setIssueId("DY-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        record.setQuality(quality);
        record.setColor(inv.getColor());
        record.setQuantityKg(qty);
        record.setDate(LocalDate.now());
        record.setInwardId(inwardId);

        IssueToDyeing saved = issueRepo.save(record);

        FabricMovement m = new FabricMovement();
        m.setRefId(saved.getIssueId());
        m.setQuality(quality);
        m.setQuantityKg(qty);
        m.setType(MovementType.ISSUE_TO_DYEING);
        m.setFromStage(FabricStage.GREIGH);
        m.setToStage(FabricStage.DYEING);
        m.setDated(LocalDate.now());
        movementRepo.save(m);

        return saved;
    }

    private Inventory findGreigeInventory(String quality, String color) {
        if (color != null) {
            return inventoryRepo
                    .findByQualityAndColorAndStage(quality, color, FabricStage.GREIGH.name())
                    .orElseThrow(() -> new RuntimeException(
                            "Greige stock not found for " + quality + " - " + color));
        }
        List<Inventory> matches = inventoryRepo.findByQualityAndStage(quality, FabricStage.GREIGH.name());
        if (matches.isEmpty()) {
            throw new RuntimeException("Greige stock not found for " + quality);
        }
        return matches.stream()
                .filter(i -> i.getAvailableKg() != null && i.getAvailableKg() > 0)
                .findFirst()
                .orElse(matches.get(0));
    }

    public List<IssueToDyeing> getAll() {
        return issueRepo.findAll();
    }
}
