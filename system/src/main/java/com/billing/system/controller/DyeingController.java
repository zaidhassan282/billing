package com.billing.system.controller;


import com.billing.system.dto.IssueRequest;
import com.billing.system.entity.IssueToDyeing;
import com.billing.system.service.IssueToDyeingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dyeing")
public class DyeingController {

    private final IssueToDyeingService service;

    public DyeingController(IssueToDyeingService service) {
        this.service = service;
    }

    @PostMapping("/issue")
    public IssueToDyeing issue(@RequestBody IssueRequest req) {
        return service.issue(
                req.getQuality(),
                req.getColor(),
                req.getQtyKg(),
                req.getInwardGatePassNo()
        );
    }
}