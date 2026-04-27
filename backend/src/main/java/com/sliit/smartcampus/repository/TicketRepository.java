package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByStudentId(Long studentId);

    List<Ticket> findByTechnicianId(Long technicianId);
}