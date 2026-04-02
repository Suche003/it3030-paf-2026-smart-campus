package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.entity.Comment;
import com.sliit.smartcampus.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentService service;

    public CommentController(CommentService service) {
        this.service = service;
    }

    @PostMapping("/ticket/{ticketId}")
    public ResponseEntity<Comment> add(
            @PathVariable Long ticketId,
            @RequestBody Comment comment
    ) {
        return ResponseEntity.ok(service.addComment(ticketId, comment));
    }

    @GetMapping("/ticket/{ticketId}")
    public List<Comment> get(@PathVariable Long ticketId) {
        return service.getByTicket(ticketId);
    }

    @PutMapping("/{id}")
    public Comment update(@PathVariable Long id, @RequestBody Comment comment) {
        return service.update(id, comment);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}