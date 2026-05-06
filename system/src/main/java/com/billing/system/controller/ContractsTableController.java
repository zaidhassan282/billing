package com.billing.system.controller;

import com.billing.system.entity.Contract;
import com.billing.system.repository.ContractRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoint used by the ContractTable.js page (POST /contracts-table per row).
 * It persists Contract rows the same way ContractController does, kept separate
 * so the frontend URL contract is preserved without redirect tricks.
 */
@RestController
@CrossOrigin
@RequestMapping("/contracts-table")
public class ContractsTableController {

    private final ContractRepository contractRepo;

    public ContractsTableController(ContractRepository contractRepo) {
        this.contractRepo = contractRepo;
    }

    @GetMapping
    public List<Contract> getAll() {
        return contractRepo.findAll();
    }

    @PostMapping
    public Contract save(@RequestBody Contract contract) {
        return contractRepo.save(contract);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        contractRepo.deleteById(id);
    }
}
