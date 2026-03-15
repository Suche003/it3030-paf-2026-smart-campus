package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.entity.Notification;
import com.sliit.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService service;

    // GET notifications by email
    @GetMapping("/{email}")
    public List<Notification> getNotifications(@PathVariable String email) {
        return service.getNotifications(email);
    }

    // MARK AS READ
    @PutMapping("/read/{id}")
    public String markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
        return "Marked as read";
    }

    // DELETE notification
    @DeleteMapping("/{id}")
    public String deleteNotification(@PathVariable Long id) {
        service.deleteNotification(id);
        return "Deleted successfully";
    }

    // TEST CREATE (optional)
    @PostMapping
    public String create(@RequestParam String email,
                         @RequestParam String message) {

        service.createNotification(email, message);
        return "Notification created";
    }
}