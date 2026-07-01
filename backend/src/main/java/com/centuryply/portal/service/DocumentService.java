package com.centuryply.portal.service;

import com.centuryply.portal.entity.Document;
import com.centuryply.portal.repository.DocumentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public List<Document> getRecentDocuments() {
        return documentRepository.findTop5ByOrderByUploadedAtDesc();
    }

    public long countDocuments() {
        return documentRepository.count();
    }

    public long countByType(String fileType) {
        return documentRepository.countByFileType(fileType);
    }

    public long countByTypes(String... fileTypes) {
        long total = 0;
        for (String fileType : fileTypes) {
            total += countByType(fileType);
        }
        return total;
    }

    public Document save(Document document) {
        document.setUploadedAt(LocalDateTime.now());
        return documentRepository.save(document);
    }

    public Optional<Document> findById(Long id) {
        return documentRepository.findById(id);
    }
}
