package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.Booking;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enumtypes.BookingStatus;
import com.sliit.smartcampus.enumtypes.ResourceStatus;
import com.sliit.smartcampus.enumtypes.Role;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.ResourceRepository;
import com.sliit.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public BookingService(
            BookingRepository bookingRepository,
            ResourceRepository resourceRepository,
            UserRepository userRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    public Booking createBooking(Long resourceId, Long userId, Booking bookingRequest) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!(user.getRole() == Role.STUDENT || user.getRole() == Role.LECTURER)) {
            throw new RuntimeException("Only students and lecturers can book resources");
        }

        if (bookingRequest.getBookingDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("You cannot book a past date");
        }

        if (!bookingRequest.getEndTime().isAfter(bookingRequest.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        int requestedQty = bookingRequest.getRequestedQuantity() == null
                ? 1
                : bookingRequest.getRequestedQuantity();

        if (requestedQty < 1) {
            throw new RuntimeException("Requested quantity must be at least 1");
        }

        boolean isEquipment = "EQUIPMENT".equalsIgnoreCase(resource.getResourceKind());

        if (isEquipment) {
            int availableQty = resource.getQuantity() == null ? 0 : resource.getQuantity();

            if (availableQty <= 0) {
                throw new RuntimeException("This equipment is currently unavailable");
            }

            if (requestedQty > availableQty) {
                throw new RuntimeException("Requested quantity is higher than available quantity");
            }
        } else {
            boolean conflictExists =
                    bookingRepository.existsByResourceIdAndBookingDateAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                            resourceId,
                            bookingRequest.getBookingDate(),
                            BookingStatus.APPROVED,
                            bookingRequest.getEndTime(),
                            bookingRequest.getStartTime()
                    );

            if (conflictExists) {
                throw new RuntimeException("This venue is already booked for the selected time");
            }
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .user(user)
                .bookingDate(bookingRequest.getBookingDate())
                .startTime(bookingRequest.getStartTime())
                .endTime(bookingRequest.getEndTime())
                .requestedQuantity(requestedQty)
                .purpose(bookingRequest.getPurpose())
                .status(BookingStatus.PENDING)
                .reviewNote(null)
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getMyBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getPendingBookings() {
        return bookingRepository.findByStatus(BookingStatus.PENDING);
    }

    public Booking approveBooking(Long bookingId, String reviewNote) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getRequestedQuantity() == null || booking.getRequestedQuantity() < 1) {
            booking.setRequestedQuantity(1);
        }

        if (booking.getStatus() == BookingStatus.APPROVED) {
            throw new RuntimeException("Booking is already approved");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new RuntimeException("Rejected booking cannot be approved");
        }

        Resource resource = booking.getResource();
        boolean isEquipment = "EQUIPMENT".equalsIgnoreCase(resource.getResourceKind());

        if (isEquipment) {
            int requestedQty = booking.getRequestedQuantity();
            int availableQty = resource.getQuantity() == null ? 0 : resource.getQuantity();

            if (requestedQty > availableQty) {
                throw new RuntimeException("Not enough equipment quantity available");
            }

            int updatedQty = availableQty - requestedQty;
            resource.setQuantity(updatedQty);

            if (updatedQty == 0) {
                resource.setStatus(ResourceStatus.OUT_OF_SERVICE);
            }

            resourceRepository.save(resource);
        } else {
            boolean conflictExists =
                    bookingRepository.existsByResourceIdAndBookingDateAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                            resource.getId(),
                            booking.getBookingDate(),
                            BookingStatus.APPROVED,
                            booking.getEndTime(),
                            booking.getStartTime()
                    );

            if (conflictExists) {
                throw new RuntimeException("Cannot approve. Venue already has an approved booking for this time");
            }
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewNote(reviewNote == null || reviewNote.isBlank() ? "Approved by technician" : reviewNote);

        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(Long bookingId, String reviewNote) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getRequestedQuantity() == null || booking.getRequestedQuantity() < 1) {
            booking.setRequestedQuantity(1);
        }

        if (booking.getStatus() == BookingStatus.APPROVED) {
            throw new RuntimeException("Approved booking cannot be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setReviewNote(reviewNote == null || reviewNote.isBlank() ? "Rejected by technician" : reviewNote);

        return bookingRepository.save(booking);
    }

    public List<Long> getUnavailableResourceIds(LocalDate bookingDate, java.time.LocalTime startTime, java.time.LocalTime endTime) {
    if (bookingDate.isBefore(LocalDate.now())) {
        throw new RuntimeException("Past dates are not allowed");
    }

    if (!endTime.isAfter(startTime)) {
        throw new RuntimeException("End time must be after start time");
    }

    List<Booking> bookings = bookingRepository
            .findByBookingDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                    bookingDate,
                    List.of(BookingStatus.PENDING, BookingStatus.APPROVED),
                    endTime,
                    startTime
            );

    return bookings.stream()
            .map(b -> b.getResource().getId())
            .distinct()
            .toList();
}

}

