package com.centuryply.portal.controller;

import com.centuryply.portal.entity.Document;
import com.centuryply.portal.service.DocumentService;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/documents")
@Validated
public class DocumentController {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "png", "jpg", "jpeg");
    private static final long MAX_UPLOAD_SIZE = 50L * 1024L * 1024L;
    private static final Pattern SAFE_FILENAME_PATTERN = Pattern.compile("^[A-Za-z0-9._-]+$");

    private final DocumentService documentService;
    private final Path uploadDirectory;

    public DocumentController(DocumentService documentService, @Value("${portal.upload-dir:uploads}") String uploadDir) throws IOException {
        this.documentService = documentService;
        this.uploadDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
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
    public ResponseEntity<Document> uploadDocument(@NotNull @RequestParam("file") MultipartFile file, Authentication auth) throws IOException {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        if (file.getSize() > MAX_UPLOAD_SIZE) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "File exceeds the maximum size limit");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        validateFilename(originalFilename);

        String extension = StringUtils.getFilenameExtension(originalFilename);
        if (extension == null || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported file type");
        }

        String baseName = originalFilename.contains(".")
                ? originalFilename.substring(0, originalFilename.lastIndexOf('.'))
                : originalFilename;
        String safeBaseName = baseName.replaceAll("[^A-Za-z0-9._-]", "_");
        String storageFilename = System.currentTimeMillis() + "-" + safeBaseName + "." + extension.toLowerCase(Locale.ROOT);
        Path targetPath = uploadDirectory.resolve(storageFilename).normalize();
        if (!targetPath.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
        }

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        Document document = new Document(
                file.getOriginalFilename(),
                storageFilename,
                extension.toLowerCase(Locale.ROOT),
                file.getSize(),
                LocalDateTime.now(),
                auth.getName()
        );
        return ResponseEntity.ok(documentService.save(document));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@Positive @PathVariable("id") Long id, Authentication auth) throws MalformedURLException {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        Document document = documentService.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        Path filePath = uploadDirectory.resolve(document.getFilename()).normalize();
        if (!filePath.startsWith(uploadDirectory) || !Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found");
        }

        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getTitle() + "\"")
                .body(resource);
    }

    @GetMapping("/preview/{id}")
    public ResponseEntity<Resource> previewDocument(@Positive @PathVariable Long id, Authentication auth) throws IOException {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        Document document = documentService.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        Path filePath = uploadDirectory.resolve(document.getFilename()).normalize();

        if (!filePath.startsWith(uploadDirectory) || !Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found");
        }

        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found");
        }

        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getTitle() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@Positive @PathVariable Long id) throws IOException {
        documentService.delete(id, uploadDirectory);
        return ResponseEntity.noContent().build();
    }

    private void validateFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name");
        }
        if (originalFilename.contains("..") || originalFilename.contains("\\") || Paths.get(originalFilename).isAbsolute() || !SAFE_FILENAME_PATTERN.matcher(originalFilename).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name");
        }
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