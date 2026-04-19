package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import com.sliit.smartcampus.enumtypes.ResourceStatus;

import java.util.List;

@Service
public class ResourceService {

    public Resource toggleStatus(Long id) {
    Resource resource = repository.findById(id).orElse(null);

    if (resource == null) {
        return null;
    }

    if (resource.getStatus() == ResourceStatus.ACTIVE) {
        resource.setStatus(ResourceStatus.OUT_OF_SERVICE);
    } else {
        resource.setStatus(ResourceStatus.ACTIVE);
    }

    return repository.save(resource);
}

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
            existing.setCodeName(resource.getCodeName());
            existing.setLabel(resource.getLabel());
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

    public List<Resource> findByLabel(String label) {
        return repository.findByLabel(label);
    }

    public List<Resource> search(String keyword) {
        return repository
                .findByNameContainingIgnoreCaseOrTypeContainingIgnoreCaseOrLabelContainingIgnoreCaseOrCodeNameContainingIgnoreCase(
                        keyword,
                        keyword,
                        keyword,
                        keyword
                );
    }

    public String generateNextCode(String label) {
        String prefix = switch (label) {
            case "Computing Faculty" -> "IT";
            case "Business School" -> "BS";
            case "Engineering Faculty" -> "EN";
            case "Humanities and Sciences Faculty" -> "HS";
            case "Common Area" -> "CO";
            default -> "";
        };

        if (prefix.isEmpty()) {
            return "";
        }

        List<Resource> resources = repository.findByCodeNameStartingWith(prefix);

        int maxNumber = resources.stream()
                .map(Resource::getCodeName)
                .filter(code -> code != null && code.matches(prefix + "\\d{3}"))
                .mapToInt(code -> Integer.parseInt(code.substring(2)))
                .max()
                .orElse(0);

        return prefix + String.format("%03d", maxNumber + 1);
    }
}