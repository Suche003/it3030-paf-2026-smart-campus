package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.enumtypes.TicketStatus;
import com.sliit.smartcampus.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tickets")
@CrossOrigin(origins = "*")
public class AdminTicketController {

    private final TicketService service;

    public AdminTicketController(TicketService service) {
        this.service = service;
    }

    //  VIEW ALL TICKETS 
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    //  TECHNICIAN VIEW 
    @GetMapping("/tech/{techId}")
    public ResponseEntity<?> getByTechnician(@PathVariable Long techId) {
        return ResponseEntity.ok(service.getByTechnician(techId));
    }

    //  ASSIGN TECHNICIAN 
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignTechnician(
            @PathVariable Long id,
            @RequestParam Long techId,
            @RequestParam String techName
    ) {
        Ticket ticket = service.assignTechnician(id, techId, techName);

        if (ticket == null) {
            return ResponseEntity.badRequest().body("Ticket not found");
        }

        return ResponseEntity.ok(ticket);
    }

    //  UPDATE STATUS 
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status
    ) {
        Ticket ticket = service.updateStatus(id, status);

        if (ticket == null) {
            return ResponseEntity.badRequest().body("Update failed");
        }

        return ResponseEntity.ok(ticket);
    }

    //  RESOLUTION 
    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveTicket(
            @PathVariable Long id,
            @RequestParam String note
    ) {
        Ticket ticket = service.addResolution(id, note);

        if (ticket == null) {
            return ResponseEntity.badRequest().body("Failed");
        }

        return ResponseEntity.ok(ticket);
    }

    //  REJECT 
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectTicket(
            @PathVariable Long id,
            @RequestParam String reason
    ) {
        Ticket ticket = service.rejectTicket(id, reason);

        if (ticket == null) {
            return ResponseEntity.badRequest().body("Failed");
        }

        return ResponseEntity.ok(ticket);
    }
}