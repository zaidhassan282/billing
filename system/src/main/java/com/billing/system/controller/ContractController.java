package com.billing.system.controller;

import com.billing.system.entity.Contract;
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

    // 🔹 GET ALL
    @GetMapping
    public List<Contract> getAll() {
        return contractRepo.findAll();
    }

    // 🔹 SAVE CONTRACT
    @PostMapping
    public Contract save(@RequestBody Contract contract) {
        return contractRepo.save(contract);
    }

    // 🔥 AUTO-FILL BY NAME
    @GetMapping("/autofill/name")
    public PermanentTable autofillByName(@RequestParam String name) {
        return permanentRepo.findByNameOfParty(name)
                .orElseThrow(() -> new RuntimeException("Party not found"));
    }

    // 🔥 AUTO-FILL BY CODE
    @GetMapping("/autofill/code")
    public PermanentTable autofillByCode(@RequestParam String code) {
        return permanentRepo.findByPartyCodeContainingIgnoreCase(code)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Party not found"));
    }
}