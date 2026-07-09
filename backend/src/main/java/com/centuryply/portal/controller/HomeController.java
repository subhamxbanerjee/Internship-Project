package com.centuryply.portal.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    /**
     * Backend Health Check Endpoint
     * Used to verify that the backend service is running.
     *
     * URL:
     * http://localhost:8081/api/health
     * http://192.168.25.137:8081/api/health
     */
    @GetMapping("/api/health")
    public String health() {
        return "CenturyPly Backend Running";
    }
}