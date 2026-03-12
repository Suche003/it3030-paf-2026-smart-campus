package com.sliit.smartcampus.entity;

import com.sliit.smartcampus.enumtypes.BookingStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User ID is required")
    @Column(nullable = false)
    private Long userId;

    @NotBlank(message = "User name is required")
    @Column(nullable = false)
    private String userName;

    @NotNull(message = "Resource ID is required")
    @Column(nullable = false)
    private Long resourceId;

    @NotBlank(message = "Resource name is required")
    @Column(nullable = false)
    private String resourceName;

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Date must be today or in future")
    @Column(nullable = false)
    private LocalDate date;

    @NotNull(message = "Start time is required")
    @Column(nullable = false)
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @Column(nullable = false)
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    @Column(nullable = false, length = 500)
    private String purpose;

    @Min(value = 1, message = "Attendees must be at least 1")
    @Column(nullable = false)
    private int attendees;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    private String rejectReason;

    @Column(nullable = false)
    private LocalTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalTime.now();
        if (status == null) {
            status = BookingStatus.PENDING;
        }
    }
}