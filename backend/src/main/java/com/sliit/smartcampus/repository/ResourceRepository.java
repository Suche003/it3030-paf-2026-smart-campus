package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByType(String type);

    List<Resource> findByLabel(String label);

    List<Resource> findByResourceKind(String resourceKind);

    List<Resource> findByCodeNameStartingWith(String prefix);

    List<Resource> findByNameContainingIgnoreCaseOrTypeContainingIgnoreCaseOrLabelContainingIgnoreCaseOrCodeNameContainingIgnoreCaseOrLocationContainingIgnoreCaseOrResourceKindContainingIgnoreCase(
            String name,
            String type,
            String label,
            String codeName,
            String location,
            String resourceKind
    );
}