package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByEmailOrderByCreatedAtDesc(String email);
}