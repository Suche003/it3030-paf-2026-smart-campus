package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.enumtypes.TicketPriority;
import com.sliit.smartcampus.enumtypes.TicketStatus;
import com.sliit.smartcampus.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TicketService {

    private final TicketRepository repository;
    private final Path uploadPath = Paths.get("uploads/tickets");

    public TicketService(TicketRepository repository) {
        this.repository = repository;
    }

    public Ticket create(Ticket ticket) {
        ticket.setStatus(TicketStatus.OPEN);
        return repository.save(ticket);
    }

    public Ticket createWithImages(
            String title,
            String category,
            String location,
            String contact,
            String resourceName,
            Long resourceId,
            String priority,
            Long studentId,
            MultipartFile image1,
            MultipartFile image2,
            MultipartFile image3
    ) {
        Ticket ticket = Ticket.builder()
                .title(title)
                .category(category)
                .location(location)
                .contact(contact)
                .resourceName(resourceName)
                .resourceId(resourceId)
                .priority(TicketPriority.valueOf(priority.toUpperCase()))
                .studentId(studentId)
                .status(TicketStatus.OPEN)
                .image1Url(saveImage(image1))
                .image2Url(saveImage(image2))
                .image3Url(saveImage(image3))
                .build();

        return repository.save(ticket);
    }

    private String saveImage(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return null;
            }

            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename();

            if (originalName == null || !originalName.contains(".")) {
                throw new RuntimeException("Invalid image file");
            }

            String ext = originalName.substring(originalName.lastIndexOf("."));
            String fileName = UUID.randomUUID() + ext;

            Path filePath = uploadPath.resolve(fileName).normalize();

            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return "/api/tickets/images/" + fileName;

        } catch (Exception e) {
            throw new RuntimeException("Image upload failed");
        }
    }

    public List<Ticket> getAll() {
        return repository.findAll();
    }

    public List<Ticket> getByStudent(Long studentId) {
        return repository.findByStudentId(studentId);
    }

    public List<Ticket> getByTechnician(Long techId) {
        return repository.findAll()
                .stream()
                .filter(t -> t.getTechnicianId() != null && t.getTechnicianId().equals(techId))
                .toList();
    }

    public Ticket update(Long id, Ticket updated) {
        Optional<Ticket> optional = repository.findById(id);

        if (optional.isEmpty()) {
            return null;
        }

        Ticket existing = optional.get();

        if (existing.getStatus() == TicketStatus.CLOSED ||
                existing.getStatus() == TicketStatus.REJECTED) {
            return null;
        }

        existing.setTitle(updated.getTitle());
        existing.setCategory(updated.getCategory());
        existing.setLocation(updated.getLocation());
        existing.setContact(updated.getContact());
        existing.setPriority(updated.getPriority());
        existing.setResourceId(updated.getResourceId());
        existing.setResourceName(updated.getResourceName());

        return repository.save(existing);
    }

    public Ticket assignTechnician(Long id, Long techId, String techName) {
        Ticket ticket = repository.findById(id).orElse(null);

        if (ticket == null) {
            return null;
        }

        ticket.setTechnicianId(techId);
        ticket.setTechnicianName(techName);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        return repository.save(ticket);
    }

    public Ticket updateStatus(Long id, TicketStatus status) {
        Ticket ticket = repository.findById(id).orElse(null);

        if (ticket == null) {
            return null;
        }

        ticket.setStatus(status);
        return repository.save(ticket);
    }

    public Ticket addResolution(Long id, String note) {
        Ticket ticket = repository.findById(id).orElse(null);

        if (ticket == null) {
            return null;
        }

        ticket.setResolutionNote(note);
        ticket.setStatus(TicketStatus.RESOLVED);

        return repository.save(ticket);
    }

    public Ticket rejectTicket(Long id, String reason) {
        Ticket ticket = repository.findById(id).orElse(null);

        if (ticket == null) {
            return null;
        }

        ticket.setRejectionReason(reason);
        ticket.setStatus(TicketStatus.REJECTED);

        return repository.save(ticket);
    }

    public boolean delete(Long id) {
        Optional<Ticket> optional = repository.findById(id);

        if (optional.isEmpty()) {
            return false;
        }

        Ticket ticket = optional.get();

        if (ticket.getStatus() != TicketStatus.OPEN) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }
}