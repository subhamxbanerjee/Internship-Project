package com.centuryply.portal.controller;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private static final String PDF_PATH = "D:\\DASHBOARD\\output\\dashboard.pdf";

    @GetMapping("/pdf")
    public ResponseEntity<Resource> getDashboardPdf() {

        File pdf = new File(PDF_PATH);

        if (!pdf.exists() || !pdf.isFile() || !pdf.canRead()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(pdf);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length())
                .cacheControl(CacheControl.maxAge(0, TimeUnit.SECONDS).noCache().cachePrivate())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"dashboard.pdf\"")
                .body(resource);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getDashboardStatus() {

        File pdf = new File(PDF_PATH);

        Map<String, Object> response = new HashMap<>();

        response.put("exists", pdf.exists());

        if (pdf.exists()) {
            response.put("version", pdf.lastModified());
            response.put("lastUpdated", pdf.lastModified());
            response.put("size", pdf.length());
        } else {
            response.put("version", 0L);
            response.put("lastUpdated", 0L);
            response.put("size", 0L);
        }

        return ResponseEntity.ok(response);
    }
}