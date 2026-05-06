package com.billing.system.controller;

import com.billing.system.repository.PermanentTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/permanent-table")
public class PermanentTableController {

    @Autowired
    private PermanentTableRepository repo;

    // 🔹 GET ALL
    @GetMapping
    public List<PermanentTable> getAll() {
        return repo.findAll();
    }

    // 🔹 SAVE (CREATE / UPDATE)
    @PostMapping
    public PermanentTable save(@RequestBody PermanentTable data) {

        // 🔴 Duplicate check
        repo.findByNtn(data.getNtn()).ifPresent(existing -> {
            if (!existing.getId().equals(data.getId())) {
                throw new RuntimeException("NTN already exists");
            }
        });

        repo.findByNameOfParty(data.getNameOfParty()).ifPresent(existing -> {
            if (!existing.getId().equals(data.getId())) {
                throw new RuntimeException("Party Name already exists");
            }
        });

        return repo.save(data);
    }

    // 🔹 DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }

    // 🔹 SEARCH (Dual Search)
    @GetMapping("/search")
    public List<PermanentTable> search(@RequestParam String query) {
        List<PermanentTable> byName = repo.findByNameOfPartyContainingIgnoreCase(query);
        List<PermanentTable> byCode = repo.findByPartyCodeContainingIgnoreCase(query);

        byName.addAll(byCode);
        return byName;
    }


}