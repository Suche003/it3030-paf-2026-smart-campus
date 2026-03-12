package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.BookingDTO;
import com.sliit.smartcampus.dto.RejectRequestDTO;
import com.sliit.smartcampus.enumtypes.BookingStatus;
import com.sliit.smartcampus.service.BookingService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // 1. Create booking
    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingDTO bookingDTO) {
        System.out.println("=== CREATE BOOKING REQUEST RECEIVED ===");
        System.out.println("Resource ID: " + bookingDTO.getResourceId());
        System.out.println("Date: " + bookingDTO.getDate());
        System.out.println("Start Time: " + bookingDTO.getStartTime());
        System.out.println("End Time: " + bookingDTO.getEndTime());
        System.out.println("Purpose: " + bookingDTO.getPurpose());
        
        try {
            BookingDTO created = bookingService.createBooking(bookingDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 2. Get all bookings (admin)
    @GetMapping
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // 3. Get user's bookings
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingDTO>> getUserBookings(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    // 4. Get single booking
    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // 5. Approve booking
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long id) {
        try {
            BookingDTO approved = bookingService.approveBooking(id);
            return ResponseEntity.ok(approved);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 6. Reject booking
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id, @Valid @RequestBody RejectRequestDTO rejectRequest) {
        try {
            BookingDTO rejected = bookingService.rejectBooking(id, rejectRequest.getReason());
            return ResponseEntity.ok(rejected);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 7. Cancel booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            BookingDTO cancelled = bookingService.cancelBooking(id);
            return ResponseEntity.ok(cancelled);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 8. Update booking (Edit - only for PENDING)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable Long id, @Valid @RequestBody BookingDTO bookingDTO) {
        try {
            BookingDTO updated = bookingService.updateBooking(id, bookingDTO);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 9. Filter bookings
    @GetMapping("/filter")
    public ResponseEntity<List<BookingDTO>> filterBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long resourceId) {
        return ResponseEntity.ok(bookingService.filterBookings(status, date, resourceId));
    }

    // 10. Check availability
    @GetMapping("/check-availability")
    public ResponseEntity<Map<String, Boolean>> checkAvailability(
            @RequestParam Long resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime) {
        
        boolean available = bookingService.isTimeSlotAvailable(resourceId, date, startTime, endTime);
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", available);
        return ResponseEntity.ok(response);
    }
}