package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository repository;

    public ResourceService(ResourceRepository repository) {
        this.repository = repository;
    }

    public Resource save(Resource resource) {
        return repository.save(resource);
    }

    public List<Resource> getAll() {
        return repository.findAll();
    }

    public Resource getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Resource update(Long id, Resource resource) {
        Resource existing = repository.findById(id).orElse(null);

        if (existing != null) {
            existing.setName(resource.getName());
            existing.setType(resource.getType());
            existing.setCapacity(resource.getCapacity());
            existing.setLocation(resource.getLocation());
            existing.setStatus(resource.getStatus());
            return repository.save(existing);
        }

        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<Resource> findByType(String type) {
        return repository.findByType(type);
    }
}