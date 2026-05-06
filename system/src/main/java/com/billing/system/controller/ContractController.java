package com.billing.system.controller;

import com.billing.system.entity.Contract;
import com.billing.system.entity.PermanentTable;
import com.billing.system.repository.ContractRepository;
import com.billing.system.repository.PermanentTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/contracts")
public class ContractController {

    @Autowired
    private ContractRepository contractRepo;

    @Autowired
    private PermanentTableRepository permanentRepo;

    @GetMapping
    public List<Contract> getAll() {
        return contractRepo.findAll();
    }

    // Alias used by InwardGatePassForm.js
    @GetMapping("/all")
    public List<Contract> getAllAlias() {
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

    @GetMapping("/autofill/name")
    public PermanentTable autofillByName(@RequestParam String name) {
        return permanentRepo.findByNameOfParty(name)
                .orElseThrow(() -> new RuntimeException("Party not found"));
    }

    @GetMapping("/autofill/code")
    public PermanentTable autofillByCode(@RequestParam String code) {
        return permanentRepo.findByPartyCodeContainingIgnoreCase(code)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Party not found"));
    }
}
