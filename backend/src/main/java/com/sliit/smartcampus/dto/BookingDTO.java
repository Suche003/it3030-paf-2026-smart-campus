package com.sliit.smartcampus.dto;

import com.sliit.smartcampus.enumtypes.BookingStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingDTO {
    
    private Long id;
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotBlank(message = "User name is required")
    private String userName;
    
    @NotNull(message = "Resource ID is required")
    private Long resourceId;
    
    private String resourceName;
    
    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Date must be today or future")
    private LocalDate date;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    @NotBlank(message = "Purpose is required")
    @Size(max = 500, message = "Purpose too long")
    private String purpose;
    
    @Min(value = 1, message = "Attendees must be at least 1")
    @Max(value = 500, message = "Attendees cannot exceed 500")
    private int attendees;
    
    private BookingStatus status;
    private String rejectReason;
    private LocalTime createdAt;
}