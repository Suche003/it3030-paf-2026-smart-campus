package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.BookingActionRequest;
import com.sliit.smartcampus.dto.BookingRequest;
import com.sliit.smartcampus.dto.BookingResponse;
import com.sliit.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    // Helper method to get current user email
    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        
        Object principal = auth.getPrincipal();
        
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            return (String) principal;
        }
        
        throw new RuntimeException("Unable to get user email");
    }

    // CREATE BOOKING
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        String email = getCurrentUserEmail();
        BookingResponse response = bookingService.createBooking(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET MY BOOKINGS
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        String email = getCurrentUserEmail();
        List<BookingResponse> bookings = bookingService.getUserBookings(email);
        return ResponseEntity.ok(bookings);
    }

    // GET ALL BOOKINGS (Admin only)
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<BookingResponse> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    // GET BOOKING BY ID
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    // GET BOOKINGS BY STATUS
    @GetMapping("/status/{status}")
    public ResponseEntity<List<BookingResponse>> getBookingsByStatus(@PathVariable String status) {
        List<BookingResponse> bookings = bookingService.getBookingsByStatus(status);
        return ResponseEntity.ok(bookings);
    }

    // UPDATE BOOKING
    @PutMapping("/{id}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingRequest request) {
        
        String email = getCurrentUserEmail();
        BookingResponse response = bookingService.updateBooking(id, email, request);
        return ResponseEntity.ok(response);
    }

    // APPROVE BOOKING (Admin only)
    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable Long id,
            @RequestBody(required = false) BookingActionRequest request) {
        
        String email = getCurrentUserEmail();
        String reason = request != null ? request.getReason() : null;
        BookingResponse response = bookingService.approveBooking(id, email, reason);
        return ResponseEntity.ok(response);
    }

    // REJECT BOOKING (Admin only)
    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable Long id,
            @RequestBody BookingActionRequest request) {
        
        if (request == null || request.getReason() == null) {
            throw new RuntimeException("Rejection reason is required");
        }
        
        String email = getCurrentUserEmail();
        BookingResponse response = bookingService.rejectBooking(id, email, request.getReason());
        return ResponseEntity.ok(response);
    }

    // CANCEL BOOKING
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> cancelBooking(@PathVariable Long id) {
        String email = getCurrentUserEmail();
        bookingService.cancelBooking(id, email);
        return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
    }
}