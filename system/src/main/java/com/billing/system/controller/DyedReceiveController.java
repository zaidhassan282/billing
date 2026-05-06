package com.billing.system.controller;

import com.billing.system.entity.DyedReceive;
import com.billing.system.service.DyedReceiveService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dyed")
public class DyedReceiveController {

    private final DyedReceiveService service;

    public DyedReceiveController(DyedReceiveService service) {
        this.service = service;
    }

    @PostMapping("/receive")
    public DyedReceive receive(@RequestBody DyedReceive receive) {
        return service.save(receive);
    }
}