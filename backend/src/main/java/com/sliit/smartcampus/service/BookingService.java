package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.BookingRequest;
import com.sliit.smartcampus.dto.BookingResponse;
import com.sliit.smartcampus.entity.Booking;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.ResourceRepository;
import com.sliit.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    // Convert to Response DTO
    private BookingResponse convertToResponse(Booking booking) {
        User user = userRepository.findById(booking.getUserId()).orElse(null);
        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        
        return new BookingResponse(
            booking.getId(),
            booking.getUserId(),
            user != null ? user.getEmail() : null,
            booking.getResourceId(),
            resource != null ? resource.getName() : null,
            booking.getBookingDate(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getPurpose(),
            booking.getAttendees(),
            booking.getStatus(),
            booking.getRejectReason(),
            booking.getCreatedAt(),
            booking.getUpdatedAt()
        );
    }

    // Check for time conflicts
    private boolean hasConflict(Long resourceId, LocalDate date, LocalTime start, LocalTime end, Long excludeBookingId) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(resourceId, date, start, end);
        if (excludeBookingId != null) {
            conflicts = conflicts.stream()
                .filter(b -> !b.getId().equals(excludeBookingId))
                .collect(Collectors.toList());
        }
        return !conflicts.isEmpty();
    }

    // ✅ 1. CREATE BOOKING
    @Transactional
    public BookingResponse createBooking(String userEmail, BookingRequest request) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Resource resource = resourceRepository.findById(request.getResourceId())
            .orElseThrow(() -> new RuntimeException("Resource not found"));

        // Check if resource is active
        if (resource.getStatus() == null || !resource.getStatus().name().equals("ACTIVE")) {
            throw new RuntimeException("Resource is not available for booking. Current status: " + 
                (resource.getStatus() != null ? resource.getStatus().name() : "UNKNOWN"));
        }

        // Validate time
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        if (request.getStartTime().equals(request.getEndTime())) {
            throw new RuntimeException("Start time and end time cannot be the same");
        }

        // Check for conflicts
        if (hasConflict(request.getResourceId(), request.getBookingDate(), 
                        request.getStartTime(), request.getEndTime(), null)) {
            throw new RuntimeException("Time conflict: Resource already booked for this time slot");
        }

        Booking booking = Booking.builder()
            .userId(user.getId())
            .resourceId(request.getResourceId())
            .bookingDate(request.getBookingDate())
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .purpose(request.getPurpose())
            .attendees(request.getAttendees() != null ? request.getAttendees() : 1)
            .status("PENDING")
            .build();

        Booking saved = bookingRepository.save(booking);
        return convertToResponse(saved);
    }

    // ✅ 2. GET USER'S BOOKINGS
    public List<BookingResponse> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return bookingRepository.findByUserId(user.getId())
            .stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    // ✅ 3. GET ALL BOOKINGS (Admin only)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
            .stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    // ✅ 4. GET BOOKINGS BY STATUS (Admin only)
    public List<BookingResponse> getBookingsByStatus(String status) {
        String upperStatus = status.toUpperCase();
        return bookingRepository.findByStatus(upperStatus)
            .stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    // ✅ 5. GET SINGLE BOOKING
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        return convertToResponse(booking);
    }

    // ✅ 6. UPDATE BOOKING (Only PENDING)
    @Transactional
    public BookingResponse updateBooking(Long id, String userEmail, BookingRequest request) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!booking.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own bookings");
        }

        if (!"PENDING".equals(booking.getStatus())) {
            throw new RuntimeException("Only pending bookings can be updated");
        }

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        // Check for conflicts (exclude current booking)
        if (hasConflict(request.getResourceId(), request.getBookingDate(), 
                        request.getStartTime(), request.getEndTime(), id)) {
            throw new RuntimeException("Time conflict: Resource already booked for this time slot");
        }

        booking.setResourceId(request.getResourceId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setAttendees(request.getAttendees());

        Booking updated = bookingRepository.save(booking);
        return convertToResponse(updated);
    }

    // ✅ 7. APPROVE BOOKING (Admin only)
    @Transactional
    public BookingResponse approveBooking(Long id, String adminEmail, String reason) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"PENDING".equals(booking.getStatus())) {
            throw new RuntimeException("Only pending bookings can be approved");
        }

        booking.setStatus("APPROVED");
        booking.setRejectReason(null);
        
        Booking updated = bookingRepository.save(booking);
        return convertToResponse(updated);
    }

    // ✅ 8. REJECT BOOKING (Admin only)
    @Transactional
    public BookingResponse rejectBooking(Long id, String adminEmail, String reason) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"PENDING".equals(booking.getStatus())) {
            throw new RuntimeException("Only pending bookings can be rejected");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Rejection reason is required");
        }

        booking.setStatus("REJECTED");
        booking.setRejectReason(reason);
        
        Booking updated = bookingRepository.save(booking);
        return convertToResponse(updated);
    }

    // ✅ 9. CANCEL BOOKING
    @Transactional
    public BookingResponse cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!booking.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        if (!"PENDING".equals(booking.getStatus()) && !"APPROVED".equals(booking.getStatus())) {
            throw new RuntimeException("Only pending or approved bookings can be cancelled");
        }

        booking.setStatus("CANCELLED");
        
        Booking updated = bookingRepository.save(booking);
        return convertToResponse(updated);
    }
}