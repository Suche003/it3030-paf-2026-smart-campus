package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enumtypes.Role;
import com.sliit.smartcampus.enumtypes.TicketStatus;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tickets")
@CrossOrigin(origins = "*")
public class AdminTicketController {

    private final TicketService service;
    private final UserRepository userRepository;

    public AdminTicketController(TicketService service, UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<User>> getTechnicians() {
        return ResponseEntity.ok(userRepository.findByRole(Role.TECHNICIAN));
    }

    @GetMapping("/tech/{techId}")
    public ResponseEntity<?> getByTechnician(@PathVariable Long techId) {
        return ResponseEntity.ok(service.getByTechnician(techId));
    }

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