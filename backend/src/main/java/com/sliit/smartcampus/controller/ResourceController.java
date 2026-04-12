package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService service;

    public ResourceController(ResourceService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Resource resource) {
        try {
            return ResponseEntity.ok(service.save(resource));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Resource code already exists");
        }
    }

    @GetMapping
    public List<Resource> getAll() {
        return service.getAll();
    }

    @GetMapping("/next-code")
    public String getNextCode(@RequestParam String label) {
        return service.generateNextCode(label);
    }

    @GetMapping("/search")
    public List<Resource> search(@RequestParam String keyword) {
        return service.search(keyword);
    }

    @GetMapping("/filter/type")
    public List<Resource> filterByType(@RequestParam String type) {
        return service.findByType(type);
    }

    @GetMapping("/filter/label")
    public List<Resource> filterByLabel(@RequestParam String label) {
        return service.findByLabel(label);
    }

    @GetMapping("/{id}")
    public Resource getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Resource resource) {
        try {
            Resource updatedResource = service.update(id, resource);

            if (updatedResource == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(updatedResource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Resource code already exists");
        }
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Deleted successfully";
    }
}