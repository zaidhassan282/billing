package com.billing.system.repository;

import com.billing.system.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByQualityAndColorAndStage(String quality, String color, String stage);

    List<Inventory> findByQualityAndStage(String quality, String stage);

    List<Inventory> findByStage(String stage);
}
