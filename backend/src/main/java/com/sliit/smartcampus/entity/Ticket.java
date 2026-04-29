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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    private Long studentId;

    private Long technicianId;

    private String technicianName;

    @Column(length = 2000)
    private String resolutionNote;

    @Column(length = 2000)
    private String rejectionReason;

    private String image1Url;
    private String image2Url;
    private String image3Url;
}