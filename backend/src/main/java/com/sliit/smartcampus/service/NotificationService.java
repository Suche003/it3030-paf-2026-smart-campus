package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.Notification;
import com.sliit.smartcampus.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;

    // CREATE NOTIFICATION
    public void createNotification(String email, String message) {

        Notification notification = Notification.builder()
                .email(email)
                .message(message)
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .build();

        repo.save(notification);
    }

    // GET ALL NOTIFICATIONS
    public List<Notification> getNotifications(String email) {
        return repo.findByEmailOrderByCreatedAtDesc(email);
    }

    // MARK AS READ
    public void markAsRead(Long id) {

        Notification n = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        n.setReadStatus(true);
        repo.save(n);
    }

    public void deleteNotification(Long id) {
        repo.deleteById(id);
    }

}