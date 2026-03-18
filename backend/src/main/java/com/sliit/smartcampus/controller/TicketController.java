package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService service;

    public TicketController(TicketService service) {
        this.service = service;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Ticket ticket) {
        return ResponseEntity.ok(service.create(ticket));
    }

    // GET ALL
    @GetMapping
    public List<Ticket> getAll() {
        return service.getAll();
    }

    // GET BY STUDENT
    @GetMapping("/student/{studentId}")
    public List<Ticket> getByStudent(@PathVariable Long studentId) {
        return service.getByStudent(studentId);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Ticket ticket
    ) {
        Ticket updated = service.update(id, ticket);

        if (updated == null) {
            return ResponseEntity.badRequest().body("Cannot update ticket");
        }

        return ResponseEntity.ok(updated);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        boolean deleted = service.delete(id);

        if (!deleted) {
            return ResponseEntity.badRequest()
                    .body("Only OPEN tickets can be deleted");
        }

        return ResponseEntity.ok("Deleted successfully");
    }
}