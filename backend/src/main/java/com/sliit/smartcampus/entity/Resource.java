package com.sliit.smartcampus.entity;

import com.sliit.smartcampus.enumtypes.ResourceStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Resource kind is required")
    @Column(nullable = false)
    private String resourceKind; // VENUE or EQUIPMENT

    @NotBlank(message = "Resource name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Resource code is required")
    @Column(nullable = false, unique = true)
    private String codeName;

    @NotBlank(message = "Resource category is required")
    @Column(nullable = false)
    private String label; // Venue: faculty/common area | Equipment: portable/fixed

    @NotBlank(message = "Resource type is required")
    @Column(nullable = false)
    private String type;

    @Min(value = 1, message = "Capacity must be at least 1")
    @Column(nullable = true)
    private Integer capacity;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(nullable = true)
    private Integer quantity;

    @Column(nullable = true)
    private Boolean portable;

    @NotBlank(message = "Location is required")
    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status;
}