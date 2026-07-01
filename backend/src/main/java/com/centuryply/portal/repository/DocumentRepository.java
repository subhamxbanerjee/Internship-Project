package com.centuryply.portal.repository;

import com.centuryply.portal.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findTop5ByOrderByUploadedAtDesc();
    long countByFileType(String fileType);
}
