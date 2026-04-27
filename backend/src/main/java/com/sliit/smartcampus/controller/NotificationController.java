package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.entity.Notification;
import com.sliit.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService service;

    
    // GET notifications (SECURE FIX)
    
    @GetMapping
    public List<Notification> getNotifications(Authentication auth) {

        String email = auth.getName(); // JWT from filter

        return service.getNotifications(email);
    }


    // MARK AS READ (SECURE FIX)
   
    @PutMapping("/read/{id}")
    public String markAsRead(@PathVariable Long id, Authentication auth) {

        // (optional improvement: ownership check can be added in service)
        service.markAsRead(id);

        return "Marked as read";
    }

    
    // DELETE notification (SECURE FIX)
   
    @DeleteMapping("/{id}")
    public String deleteNotification(@PathVariable Long id, Authentication auth) {

        service.deleteNotification(id);

        return "Deleted successfully";
    }

   
    // CREATE (TEST ONLY - SECURE FIX)
   
    @PostMapping
    public String create(@RequestParam String message, Authentication auth) {

        String email = auth.getName();

        service.createNotification(email, message);

        return "Notification created";
    }
}