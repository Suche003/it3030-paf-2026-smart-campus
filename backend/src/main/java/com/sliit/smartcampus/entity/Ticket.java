package com.sliit.smartcampus.entity;

import com.sliit.smartcampus.enumtypes.TicketPriority;
import com.sliit.smartcampus.enumtypes.TicketStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Student inputs
    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String contact;

    @Column(nullable = false)
    private String resourceName;

    @Column(nullable = false)
    private Long resourceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;

    // Workflow
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    // Temporary student tracking (until login added)
    private Long studentId;

    // Admin assignment
    private Long technicianId;

    private String technicianName;

    // Resolution
    @Column(length = 2000)
    private String resolutionNote;

    // Rejected reason
    @Column(length = 2000)
    private String rejectionReason;
}