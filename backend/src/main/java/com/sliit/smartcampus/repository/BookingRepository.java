package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Booking;
import com.sliit.smartcampus.enumtypes.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByResourceId(Long resourceId);

    List<Booking> findByStatus(BookingStatus status);

    boolean existsByResourceIdAndBookingDateAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            Long resourceId,
            LocalDate bookingDate,
            BookingStatus status,
            LocalTime endTime,
            LocalTime startTime
    );

    boolean existsByResourceIdAndBookingDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            Long resourceId,
            LocalDate bookingDate,
            List<BookingStatus> statuses,
            LocalTime endTime,
            LocalTime startTime
    );

    List<Booking> findByBookingDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            LocalDate bookingDate,
            List<BookingStatus> statuses,
            LocalTime endTime,
            LocalTime startTime
    );
}