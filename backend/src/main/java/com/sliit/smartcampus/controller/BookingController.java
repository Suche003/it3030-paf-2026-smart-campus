package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.entity.Booking;
import com.sliit.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestParam Long resourceId,
            @RequestParam Long userId,
            @Valid @RequestBody Booking booking
    ) {
        try {
            return ResponseEntity.ok(service.createBooking(resourceId, userId, booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllBookings() {
        return ResponseEntity.ok(service.getAllBookings());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings(@RequestParam Long userId) {
        return ResponseEntity.ok(service.getMyBookings(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingBookings() {
        return ResponseEntity.ok(service.getPendingBookings());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String reviewNote
    ) {
        try {
            return ResponseEntity.ok(service.approveBooking(id, reviewNote));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String reviewNote
    ) {
        try {
            return ResponseEntity.ok(service.rejectBooking(id, reviewNote));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}