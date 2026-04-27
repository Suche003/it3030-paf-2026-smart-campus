package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.enumtypes.ResourceStatus;
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
        validateResource(resource);
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

        if (existing == null) {
            return null;
        }

        // Locked after creation
        existing.setResourceKind(existing.getResourceKind());
        existing.setCodeName(existing.getCodeName());

        // Editable fields
        existing.setName(resource.getName());
        existing.setLabel(resource.getLabel());
        existing.setType(resource.getType());
        existing.setCapacity(resource.getCapacity());
        existing.setQuantity(resource.getQuantity());
        existing.setPortable(resource.getPortable());
        existing.setLocation(resource.getLocation());
        existing.setStatus(resource.getStatus());

        validateResource(existing);

        return repository.save(existing);
    }

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

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<Resource> findByType(String type) {
        return repository.findByType(type);
    }

    public List<Resource> findByLabel(String label) {
        return repository.findByLabel(label);
    }

    public List<Resource> findByResourceKind(String resourceKind) {
        return repository.findByResourceKind(resourceKind);
    }

    public List<Resource> search(String keyword) {
        return repository
                .findByNameContainingIgnoreCaseOrTypeContainingIgnoreCaseOrLabelContainingIgnoreCaseOrCodeNameContainingIgnoreCaseOrLocationContainingIgnoreCaseOrResourceKindContainingIgnoreCase(
                        keyword,
                        keyword,
                        keyword,
                        keyword,
                        keyword,
                        keyword
                );
    }

    public String generateNextCode(String label, String resourceKind) {
        String prefix;

        if ("EQUIPMENT".equalsIgnoreCase(resourceKind)) {
            prefix = "EQ";
        } else {
            prefix = switch (label) {
                case "Computing Faculty" -> "IT";
                case "Business School" -> "BS";
                case "Engineering Faculty" -> "EN";
                case "Humanities and Sciences Faculty" -> "HS";
                case "Common Area" -> "CO";
                default -> "";
            };
        }

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

    private void validateResource(Resource resource) {
        if (resource.getStatus() == null) {
            resource.setStatus(ResourceStatus.ACTIVE);
        }

        if (resource.getResourceKind() == null || resource.getResourceKind().isBlank()) {
            throw new IllegalArgumentException("Resource kind is required");
        }

        String kind = resource.getResourceKind().trim().toUpperCase();
        resource.setResourceKind(kind);

        if ("EQUIPMENT".equals(kind)) {
            if (resource.getQuantity() == null || resource.getQuantity() < 1) {
                throw new IllegalArgumentException("Equipment quantity must be at least 1");
            }

            if (!"Portable".equalsIgnoreCase(resource.getLabel())
                    && !"Fixed".equalsIgnoreCase(resource.getLabel())) {
                throw new IllegalArgumentException("Equipment category must be Portable or Fixed");
            }

            resource.setCapacity(null);
            resource.setPortable("Portable".equalsIgnoreCase(resource.getLabel()));

        } else if ("VENUE".equals(kind)) {
            if (resource.getCapacity() == null || resource.getCapacity() < 1) {
                throw new IllegalArgumentException("Venue capacity must be at least 1");
            }

            resource.setQuantity(null);
            resource.setPortable(false);

        } else {
            throw new IllegalArgumentException("Resource kind must be VENUE or EQUIPMENT");
        }
    }
}