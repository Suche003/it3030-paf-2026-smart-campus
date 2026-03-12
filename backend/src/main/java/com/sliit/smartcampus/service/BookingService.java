package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.BookingDTO;
import com.sliit.smartcampus.entity.Booking;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.enumtypes.BookingStatus;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public BookingService(BookingRepository bookingRepository, ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    // Create booking with conflict checking
    @Transactional
    public BookingDTO createBooking(BookingDTO bookingDTO) {
        // Check if resource exists and is active
        Resource resource = resourceRepository.findById(bookingDTO.getResourceId())
            .orElseThrow(() -> new EntityNotFoundException("Resource not found"));
        
        if (resource.getStatus().toString().equals("OUT_OF_SERVICE")) {
            throw new IllegalStateException("Resource is currently out of service");
        }
        
        // Set resource name
        bookingDTO.setResourceName(resource.getName());
        
        // Validate time range
        if (bookingDTO.getStartTime().isAfter(bookingDTO.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        
        // Validate date is not past
        if (bookingDTO.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot book for past dates");
        }
        
        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            bookingDTO.getResourceId(),
            bookingDTO.getDate(),
            bookingDTO.getStartTime(),
            bookingDTO.getEndTime()
        );
        
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Time conflict: Resource already booked for this time slot");
        }
        
        // Create booking
        Booking booking = Booking.builder()
            .userId(bookingDTO.getUserId())
            .userName(bookingDTO.getUserName())
            .resourceId(bookingDTO.getResourceId())
            .resourceName(bookingDTO.getResourceName())
            .date(bookingDTO.getDate())
            .startTime(bookingDTO.getStartTime())
            .endTime(bookingDTO.getEndTime())
            .purpose(bookingDTO.getPurpose())
            .attendees(bookingDTO.getAttendees())
            .status(BookingStatus.PENDING)
            .build();
        
        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }

    // Update booking (only for PENDING bookings)
    @Transactional
    public BookingDTO updateBooking(Long id, BookingDTO bookingDTO) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        
        // Only allow editing of PENDING bookings
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be edited");
        }
        
        // Validate time range
        if (bookingDTO.getStartTime().isAfter(bookingDTO.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        
        // Validate date is not past
        if (bookingDTO.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot book for past dates");
        }
        
        // Check for conflicts with other bookings (excluding current booking)
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            bookingDTO.getResourceId(),
            bookingDTO.getDate(),
            bookingDTO.getStartTime(),
            bookingDTO.getEndTime()
        );
        
        // Remove current booking from conflicts list
        conflicts.removeIf(b -> b.getId().equals(id));
        
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Time conflict: Resource already booked for this time slot");
        }
        
        // Update fields
        booking.setDate(bookingDTO.getDate());
        booking.setStartTime(bookingDTO.getStartTime());
        booking.setEndTime(bookingDTO.getEndTime());
        booking.setPurpose(bookingDTO.getPurpose());
        booking.setAttendees(bookingDTO.getAttendees());
        
        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }

    // Get all bookings (for admin)
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Get user's own bookings
    public List<BookingDTO> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Get single booking
    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        return convertToDTO(booking);
    }
    
    // Approve booking
    @Transactional
    public BookingDTO approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be approved");
        }
        
        booking.setStatus(BookingStatus.APPROVED);
        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }
    
    // Reject booking with reason
    @Transactional
    public BookingDTO rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be rejected");
        }
        
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectReason(reason);
        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }
    
    // Cancel booking (user can cancel if not already past)
    @Transactional
    public BookingDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        
        if (booking.getStatus() == BookingStatus.APPROVED && booking.getDate().isBefore(LocalDate.now())) {
            throw new IllegalStateException("Cannot cancel past bookings");
        }
        
        if (booking.getStatus() == BookingStatus.REJECTED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cannot cancel already rejected or cancelled booking");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }
    
    // Filter bookings
    public List<BookingDTO> filterBookings(BookingStatus status, LocalDate date, Long resourceId) {
        return bookingRepository.filterBookings(status, date, resourceId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Check if time slot is available
    public boolean isTimeSlotAvailable(Long resourceId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(resourceId, date, startTime, endTime);
        return conflicts.isEmpty();
    }
    
    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUserId());
        dto.setUserName(booking.getUserName());
        dto.setResourceId(booking.getResourceId());
        dto.setResourceName(booking.getResourceName());
        dto.setDate(booking.getDate());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setPurpose(booking.getPurpose());
        dto.setAttendees(booking.getAttendees());
        dto.setStatus(booking.getStatus());
        dto.setRejectReason(booking.getRejectReason());
        dto.setCreatedAt(booking.getCreatedAt());
        return dto;
    }
}