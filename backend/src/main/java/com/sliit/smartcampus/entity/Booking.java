package com.sliit.smartcampus.entity;

import com.sliit.smartcampus.enumtypes.BookingStatus;
import jakarta.persistence.*;
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

    @NotNull(message = "Resource is required")
    @ManyToOne
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @NotNull(message = "User is required")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Booking date is required")
    @Column(nullable = false)
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    @Column(nullable = false)
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Integer requestedQuantity = 1;

    @NotBlank(message = "Purpose is required")
    @Column(nullable = false, length = 500)
    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(length = 500)
    private String reviewNote;

    @PrePersist
    @PreUpdate
    public void setDefaults() {
        if (requestedQuantity == null || requestedQuantity < 1) {
            requestedQuantity = 1;
        }
    }
}