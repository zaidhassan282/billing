package com.billing.system.service;

import com.billing.system.entity.Inventory;
import com.billing.system.entity.OutwardGatePass;
import com.billing.system.entity.OutwardItem;
import com.billing.system.enums.FabricStage;
import com.billing.system.repository.InventoryRepository;
import com.billing.system.repository.OutwardGatePassRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class OutwardGatePassService {

    private static final String TYPE_ISSUE = "ISSUE";
    private static final String TYPE_RETURN = "RETURN";

    private final OutwardGatePassRepository outwardRepo;
    private final InventoryRepository inventoryRepo;

    public OutwardGatePassService(OutwardGatePassRepository outwardRepo,
                                  InventoryRepository inventoryRepo) {
        this.outwardRepo = outwardRepo;
        this.inventoryRepo = inventoryRepo;
    }

    @Transactional
    public OutwardGatePass save(OutwardGatePass outward) {

        if (outward.getOutwardId() == null || outward.getOutwardId().isEmpty()) {
            outward.setOutwardId("OGP-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        }

        if (outward.getDated() == null) {
            outward.setDated(LocalDate.now());
        }

        if (outward.getType() == null || outward.getType().isEmpty()) {
            outward.setType(TYPE_ISSUE);
        }

        if (outward.getItems() == null || outward.getItems().isEmpty()) {
            throw new RuntimeException("At least one item is required");
        }

        if (outward.getCustomerName() == null || outward.getCustomerName().isEmpty()) {
            throw new RuntimeException("Customer name is required");
        }

        for (OutwardItem item : outward.getItems()) {
            item.setOutward(outward);

            if (item.getQuality() == null || item.getQuality().isEmpty()) {
                throw new RuntimeException("Quality is required");
            }
            if (item.getKg() == null || item.getKg() <= 0) {
                throw new RuntimeException("Weight (kg) must be greater than 0");
            }
            if (item.getColor() == null || item.getColor().isEmpty()) {
                item.setColor("NA");
            }
            if (item.getMeters() == null) item.setMeters(0.0);
            if (item.getRoll() == null) item.setRoll(0);

            if (TYPE_RETURN.equalsIgnoreCase(outward.getType())) {
                returnToInventory(outward.getOutwardId(), item);
            } else {
                deductFromInventory(item);
            }
        }

        return outwardRepo.save(outward);
    }

    public OutwardGatePass issue(OutwardGatePass outward) {
        outward.setType(TYPE_ISSUE);
        return save(outward);
    }

    public OutwardGatePass returnFromCustomer(OutwardGatePass outward) {
        outward.setType(TYPE_RETURN);
        return save(outward);
    }

    private void deductFromInventory(OutwardItem item) {
        Inventory inv = inventoryRepo
                .findByQualityAndColorAndStage(item.getQuality(), item.getColor(), FabricStage.DYED.name())
                .orElseGet(() -> inventoryRepo
                        .findByQualityAndColorAndStage(item.getQuality(), item.getColor(), FabricStage.GREIGH.name())
                        .orElseThrow(() -> new RuntimeException(
                                "Stock not found for " + item.getQuality() + " - " + item.getColor())));

        if (inv.getAvailableKg() == null || inv.getAvailableKg() < item.getKg()) {
            throw new RuntimeException("Not enough stock for " + item.getQuality()
                    + ". Available: " + inv.getAvailableKg());
        }

        inv.setAvailableKg(inv.getAvailableKg() - item.getKg());
        if (inv.getAvailableMeters() != null && item.getMeters() != null) {
            inv.setAvailableMeters(Math.max(0.0, inv.getAvailableMeters() - item.getMeters()));
        }
        inventoryRepo.save(inv);
    }

    private void returnToInventory(String refId, OutwardItem item) {
        Inventory inv = inventoryRepo
                .findByQualityAndColorAndStage(item.getQuality(), item.getColor(), FabricStage.DYED.name())
                .orElse(null);

        if (inv == null) {
            inv = new Inventory();
            inv.setRefId(refId);
            inv.setStage(FabricStage.DYED.name());
            inv.setQuality(item.getQuality());
            inv.setColor(item.getColor());
            inv.setAvailableKg(item.getKg());
            inv.setAvailableMeters(item.getMeters());
        } else {
            inv.setAvailableKg((inv.getAvailableKg() == null ? 0.0 : inv.getAvailableKg()) + item.getKg());
            inv.setAvailableMeters((inv.getAvailableMeters() == null ? 0.0 : inv.getAvailableMeters())
                    + (item.getMeters() == null ? 0.0 : item.getMeters()));
        }
        inventoryRepo.save(inv);
    }

    public List<OutwardGatePass> getAll() {
        return outwardRepo.findAll();
    }

    public OutwardGatePass getByOutwardId(String outwardId) {
        return outwardRepo.findByOutwardId(outwardId)
                .orElseThrow(() -> new RuntimeException("Outward not found: " + outwardId));
    }
}
