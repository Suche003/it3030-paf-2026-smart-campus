package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.enumtypes.TicketStatus;
import com.sliit.smartcampus.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository repository;

    public TicketService(TicketRepository repository) {
        this.repository = repository;
    }

    //  CREATE 
    public Ticket create(Ticket ticket) {
        ticket.setStatus(TicketStatus.OPEN);
        return repository.save(ticket);
    }

    //  GET ALL 
    public List<Ticket> getAll() {
        return repository.findAll();
    }

    //  GET BY ID 
    public Ticket getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    //  STUDENT TICKETS 
    public List<Ticket> getByStudent(Long studentId) {
        return repository.findByStudentId(studentId);
    }

    //  UPDATE TICKET 
    public Ticket update(Long id, Ticket updated) {

        Optional<Ticket> optional = repository.findById(id);
        if (optional.isEmpty()) return null;

        Ticket existing = optional.get();

        if (existing.getStatus() == TicketStatus.CLOSED ||
            existing.getStatus() == TicketStatus.REJECTED) {
            return null;
        }

        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setCategory(updated.getCategory());
        existing.setLocation(updated.getLocation());
        existing.setContact(updated.getContact());
        existing.setPriority(updated.getPriority());
        existing.setResourceId(updated.getResourceId());
        existing.setResourceName(updated.getResourceName());

        return repository.save(existing);
    }

    //  DELETE 
    public boolean delete(Long id) {

        Optional<Ticket> optional = repository.findById(id);
        if (optional.isEmpty()) return false;

        Ticket ticket = optional.get();

        if (ticket.getStatus() != TicketStatus.OPEN) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }

    //  ASSIGN TECHNICIAN 
    public Ticket assignTechnician(Long id, Long techId, String techName) {

        Optional<Ticket> optional = repository.findById(id);
        if (optional.isEmpty()) return null;

        Ticket ticket = optional.get();

        if (ticket.getStatus() == TicketStatus.CLOSED) return null;

        ticket.setTechnicianId(techId);
        ticket.setTechnicianName(techName);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        return repository.save(ticket);
    }

    //  STATUS UPDATE 
    public Ticket updateStatus(Long id, TicketStatus status) {

        Optional<Ticket> optional = repository.findById(id);
        if (optional.isEmpty()) return null;

        Ticket ticket = optional.get();

        if (ticket.getStatus() == TicketStatus.CLOSED) return null;

        ticket.setStatus(status);
        return repository.save(ticket);
    }

    //  RESOLUTION 
    public Ticket addResolution(Long id, String note) {

        Optional<Ticket> optional = repository.findById(id);
        if (optional.isEmpty()) return null;

        Ticket ticket = optional.get();

        ticket.setResolutionNote(note);
        ticket.setStatus(TicketStatus.RESOLVED);

        return repository.save(ticket);
    }

    //  REJECT 
    public Ticket rejectTicket(Long id, String reason) {

        Optional<Ticket> optional = repository.findById(id);
        if (optional.isEmpty()) return null;

        Ticket ticket = optional.get();

        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(reason);

        return repository.save(ticket);
    }

    //  TECHNICIAN VIEW 
    public List<Ticket> getByTechnician(Long techId) {
        return repository.findByTechnicianId(techId);
    }
}