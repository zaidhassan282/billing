package com.billing.system.service;


import com.billing.system.dto.IssueRequest;
import com.billing.system.entity.DyedReceive;
import com.billing.system.entity.Inventory;
import com.billing.system.entity.FabricMovement;
import com.billing.system.enums.FabricStage;
import com.billing.system.enums.MovementType;
import com.billing.system.repository.DyedReceiveRepository;
import com.billing.system.repository.InventoryRepository;
import com.billing.system.repository.FabricMovementRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class DyedReceiveService {

    private final DyedReceiveRepository dyedRepo;
    private final InventoryRepository inventoryRepo;
    private final FabricMovementRepository movementRepo;

    public DyedReceiveService(
            DyedReceiveRepository dyedRepo,
            InventoryRepository inventoryRepo,
            FabricMovementRepository movementRepo
    ) {
        this.dyedRepo = dyedRepo;
        this.inventoryRepo = inventoryRepo;
        this.movementRepo = movementRepo;
    }

    public DyedReceive save(DyedReceive receive) {

        // 🔥 Auto ID
        receive.setNewId("DR-" + UUID.randomUUID().toString().substring(0, 6));

        // 🔥 Date
        if (receive.getDated() == null) {
            receive.setDated(LocalDate.now());
        }

        // 🔥 ADD TO INVENTORY
        Inventory inv = new Inventory();
        inv.setGatePassNo(receive.getContractNo()); // ✅ FIXED
        inv.setQuality(receive.getQuality());
        inv.setAvailableKg(receive.getQuantityKg());

        inventoryRepo.save(inv);

        // 🔥 TRACK MOVEMENT
        FabricMovement m = new FabricMovement();
        m.setRefId(receive.getNewId());
        m.setQuality(receive.getQuality());
        m.setQuantityKg(receive.getQuantityKg());
        m.setType(MovementType.RECEIVED_DYED);
        m.setFromStage(FabricStage.DYEING);
        m.setToStage(FabricStage.DYED);
        m.setDated(LocalDate.now());

        movementRepo.save(m);

        return dyedRepo.save(receive);
    }
}