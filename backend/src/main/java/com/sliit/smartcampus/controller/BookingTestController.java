package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.entity.Booking;
import com.sliit.smartcampus.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test/bookings")
@CrossOrigin(origins = "*")
public class BookingTestController {

    private final BookingService service;

    public BookingTestController(BookingService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> createBookingTest(
            @RequestParam Long resourceId,
            @RequestParam Long userId,
            @RequestBody Booking booking
    ) {
        try {
            return ResponseEntity.ok(
                    service.createBooking(resourceId, userId, booking)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllBookingsTest() {
        return ResponseEntity.ok(service.getAllBookings());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyBookingsTest(@RequestParam Long userId) {
        return ResponseEntity.ok(service.getMyBookings(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingBookingsTest() {
        return ResponseEntity.ok(service.getPendingBookings());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBookingTest(
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
    public ResponseEntity<?> rejectBookingTest(
            @PathVariable Long id,
            @RequestParam(required = false) String reviewNote
    ) {
        try {
            return ResponseEntity.ok(service.rejectBooking(id, reviewNote));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/unavailable-resources")
public ResponseEntity<?> getUnavailableResources(
        @RequestParam String bookingDate,
        @RequestParam String startTime,
        @RequestParam String endTime
) {
    try {
        return ResponseEntity.ok(
                service.getUnavailableResourceIds(
                        java.time.LocalDate.parse(bookingDate),
                        java.time.LocalTime.parse(startTime),
                        java.time.LocalTime.parse(endTime)
                )
        );
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
}