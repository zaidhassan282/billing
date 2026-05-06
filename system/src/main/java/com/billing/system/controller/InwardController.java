package com.billing.system.controller;

import com.billing.system.entity.InwardGatePass;
import com.billing.system.service.InwardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inward") // 🔥 THIS IS IMPORTANT
@CrossOrigin
public class InwardController {

    private final InwardService inwardService;

    public InwardController(InwardService inwardService) {
        this.inwardService = inwardService;
    }

    // ✅ SAVE INWARD
    @PostMapping
    public InwardGatePass save(@RequestBody InwardGatePass inward) {
        return inwardService.save(inward);
    }

    // ✅ GET ALL
    @GetMapping
    public Object getAll() {
        return inwardService.getAll();
    }
}