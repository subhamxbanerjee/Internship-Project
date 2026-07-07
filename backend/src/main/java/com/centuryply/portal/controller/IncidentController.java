package com.centuryply.portal.controller;

import com.centuryply.portal.dto.IncidentRequest;
import com.centuryply.portal.dto.IncidentResponse;
import com.centuryply.portal.entity.Incident;
import com.centuryply.portal.service.IncidentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {
    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public ResponseEntity<List<IncidentResponse>> listIncidents(Authentication auth) {
        List<IncidentResponse> incidents = incidentService.getAllIncidentsForUser(auth.getName()).stream()
            .map(IncidentResponse::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> getIncident(@Positive @PathVariable("id") Long id, Authentication auth) {
        return incidentService.getIncidentByIdForUser(id, auth.getName())
            .map(IncidentResponse::fromEntity)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<IncidentResponse> createIncident(@Valid @RequestBody IncidentRequest request, Authentication auth) {
        Incident incident = incidentService.createIncident(
            request.getTitle(),
            request.getDescription(),
            request.getDepartment(),
            request.getPriority(),
            auth.getName()
        );
        return ResponseEntity.ok(IncidentResponse.fromEntity(incident));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<IncidentResponse> assignEmployee(@Positive @PathVariable("id") Long id, @Valid @RequestBody IncidentRequest request, Authentication auth) {
        Incident incident = incidentService.assignEmployee(id, request.getAssignedTo(), auth.getName());
        return ResponseEntity.ok(IncidentResponse.fromEntity(incident));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<IncidentResponse> updateStatus(@Positive @PathVariable("id") Long id, @Valid @RequestBody IncidentRequest request, Authentication auth) {
        Incident incident = incidentService.updateStatus(id, request.getStatus(), auth.getName());
        return ResponseEntity.ok(IncidentResponse.fromEntity(incident));
    }

    @PutMapping("/{id}/priority")
    public ResponseEntity<IncidentResponse> updatePriority(@Positive @PathVariable("id") Long id, @Valid @RequestBody IncidentRequest request, Authentication auth) {
        Incident incident = incidentService.updatePriority(id, request.getPriority(), auth.getName());
        return ResponseEntity.ok(IncidentResponse.fromEntity(incident));
    }

    @PutMapping("/{id}/comment")
    public ResponseEntity<IncidentResponse> addComment(@Positive @PathVariable("id") Long id, @Valid @RequestBody IncidentRequest request, Authentication auth) {
        Incident incident = incidentService.addComment(id, request.getComment(), auth.getName());
        return ResponseEntity.ok(IncidentResponse.fromEntity(incident));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<IncidentResponse> closeIncident(@Positive @PathVariable("id") Long id, Authentication auth) {
        Incident incident = incidentService.closeIncident(id, auth.getName());
        return ResponseEntity.ok(IncidentResponse.fromEntity(incident));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteIncident(@Positive @PathVariable("id") Long id, Authentication auth) {
        incidentService.deleteIncident(id, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Incident deleted"));
    }
}
