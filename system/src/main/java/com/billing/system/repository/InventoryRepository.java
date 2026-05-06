package com.billing.system.repository;

import com.billing.system.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findByInwardId(String inwardId);

    Optional<Inventory> findByInwardIdAndQuality(String inwardId, String quality);

    Optional<Inventory> findByQualityAndColor(String quality, String color);

}