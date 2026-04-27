package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.Comment;
import com.sliit.smartcampus.repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository repository;

    public CommentService(CommentRepository repository) {
        this.repository = repository;
    }

    public Comment addComment(Long ticketId, Comment comment) {

        Comment c = new Comment();
        c.setTicketId(ticketId);
        c.setUserId(comment.getUserId());
        c.setText(comment.getText());

        return repository.save(c);
    }

    public List<Comment> getByTicket(Long ticketId) {
        return repository.findByTicketId(ticketId);
    }

    public Comment update(Long id, Comment data) {
        Comment c = repository.findById(id).orElse(null);
        if (c == null) return null;

        c.setText(data.getText());
        return repository.save(c);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}