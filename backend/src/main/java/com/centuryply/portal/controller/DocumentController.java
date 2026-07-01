package com.centuryply.portal.controller;

import com.centuryply.portal.entity.Document;
import com.centuryply.portal.service.DocumentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    private final DocumentService documentService;
    private final Path uploadDirectory;

    public DocumentController(DocumentService documentService, @Value("${portal.upload-dir}") String uploadDir) throws IOException {
        this.documentService = documentService;
        this.uploadDirectory = Paths.get(uploadDir).toAbsolutePath();
        Files.createDirectories(this.uploadDirectory);
    }

    @GetMapping
    public ResponseEntity<List<Document>> listDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Document>> recentDocuments() {
        return ResponseEntity.ok(documentService.getRecentDocuments());
    }

    @GetMapping("/summary")
    public ResponseEntity<DocumentSummary> documentSummary() {
        DocumentSummary summary = new DocumentSummary();
        summary.setTotal(documentService.countDocuments());
        summary.setPdfCount(documentService.countByTypes("pdf"));
        summary.setExcelCount(documentService.countByTypes("xlsx", "xls"));
        summary.setWordCount(documentService.countByTypes("docx", "doc"));
        summary.setPowerPointCount(documentService.countByTypes("pptx", "ppt"));
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(@RequestParam("file") MultipartFile file, @RequestParam("uploadedBy") String uploadedBy) throws IOException {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileType = StringUtils.getFilenameExtension(originalFilename);
        String storageFilename = System.currentTimeMillis() + "-" + originalFilename;
        Path targetPath = uploadDirectory.resolve(storageFilename);
        Files.copy(file.getInputStream(), targetPath);

        Document document = new Document(file.getOriginalFilename(), storageFilename, fileType != null ? fileType : "unknown", file.getSize(), LocalDateTime.now(), uploadedBy);
        return ResponseEntity.ok(documentService.save(document));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable("id") Long id) throws MalformedURLException {
        Document document = documentService.findById(id).orElseThrow();

        Path filePath = uploadDirectory.resolve(document.getFilename()).normalize();
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }
        String contentType = "application/octet-stream";

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getTitle() + "\"")
            .body(resource);
    }

    public static class DocumentSummary {
        private long total;
        private long pdfCount;
        private long excelCount;
        private long wordCount;
        private long powerPointCount;

        public long getTotal() {
            return total;
        }

        public void setTotal(long total) {
            this.total = total;
        }

        public long getPdfCount() {
            return pdfCount;
        }

        public void setPdfCount(long pdfCount) {
            this.pdfCount = pdfCount;
        }

        public long getExcelCount() {
            return excelCount;
        }

        public void setExcelCount(long excelCount) {
            this.excelCount = excelCount;
        }

        public long getWordCount() {
            return wordCount;
        }

        public void setWordCount(long wordCount) {
            this.wordCount = wordCount;
        }

        public long getPowerPointCount() {
            return powerPointCount;
        }

        public void setPowerPointCount(long powerPointCount) {
            this.powerPointCount = powerPointCount;
        }
    }
}
