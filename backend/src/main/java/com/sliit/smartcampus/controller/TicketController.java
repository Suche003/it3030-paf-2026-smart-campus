package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.service.TicketService;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService service;

    public TicketController(TicketService service) {
        this.service = service;
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> create(@RequestBody Ticket ticket) {
        return ResponseEntity.ok(service.create(ticket));
    }

    @PostMapping(value = "/with-images", consumes = "multipart/form-data")
    public ResponseEntity<?> createWithImages(
            @RequestParam String title,
            @RequestParam String category,
            @RequestParam String location,
            @RequestParam String contact,
            @RequestParam String resourceName,
            @RequestParam Long resourceId,
            @RequestParam String priority,
            @RequestParam Long studentId,
            @RequestParam(required = false) MultipartFile image1,
            @RequestParam(required = false) MultipartFile image2,
            @RequestParam(required = false) MultipartFile image3
    ) {
        try {
            return ResponseEntity.ok(
                    service.createWithImages(
                            title,
                            category,
                            location,
                            contact,
                            resourceName,
                            resourceId,
                            priority,
                            studentId,
                            image1,
                            image2,
                            image3
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/images/{fileName:.+}")
    public ResponseEntity<?> getImage(@PathVariable String fileName) {
        try {
            Path path = Paths.get("uploads/tickets")
                    .resolve(fileName)
                    .normalize()
                    .toAbsolutePath();

            UrlResource resource = new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(path);

            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Image not found");
        }
    }

    @GetMapping
    public List<Ticket> getAll() {
        return service.getAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Ticket> getByStudent(@PathVariable Long studentId) {
        return service.getByStudent(studentId);
    }

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