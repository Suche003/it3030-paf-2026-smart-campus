package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Booking;
import com.sliit.smartcampus.enumtypes.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByResourceId(Long resourceId);

    // Check for overlapping bookings (conflict detection)
    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId " +
           "AND b.date = :date " +
           "AND b.status IN ('APPROVED', 'PENDING') " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookings(
        @Param("resourceId") Long resourceId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );

    List<Booking> findByDate(LocalDate date);

    List<Booking> findByResourceIdAndStatus(Long resourceId, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:date IS NULL OR b.date = :date) AND " +
           "(:resourceId IS NULL OR b.resourceId = :resourceId)")
    List<Booking> filterBookings(
        @Param("status") BookingStatus status,
        @Param("date") LocalDate date,
        @Param("resourceId") Long resourceId
    );
}