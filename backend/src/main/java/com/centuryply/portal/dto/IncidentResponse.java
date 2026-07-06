package com.centuryply.portal.dto;

import com.centuryply.portal.entity.Incident;
import com.centuryply.portal.entity.Department;
import com.centuryply.portal.entity.Priority;
import com.centuryply.portal.entity.Status;

import java.time.LocalDateTime;

public class IncidentResponse {
    private Long id;
    private String incidentNumber;
    private String title;
    private String description;
    private Department department;
    private Priority priority;
    private Status status;
    private String createdBy;
    private String assignedTo;
    private String employeeComment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime closedAt;
    private String closedBy;

    public static IncidentResponse fromEntity(Incident incident) {
        IncidentResponse response = new IncidentResponse();
        response.setId(incident.getId());
        response.setIncidentNumber(incident.getIncidentNumber());
        response.setTitle(incident.getTitle());
        response.setDescription(incident.getDescription());
        response.setDepartment(incident.getDepartment());
        response.setPriority(incident.getPriority());
        response.setStatus(incident.getStatus());
        response.setCreatedBy(incident.getCreatedByUser() != null ? incident.getCreatedByUser().getUsername() : null);
        response.setAssignedTo(incident.getAssignedToUser() != null ? incident.getAssignedToUser().getUsername() : null);
        response.setEmployeeComment(incident.getEmployeeComment());
        response.setCreatedAt(incident.getCreatedAt());
        response.setUpdatedAt(incident.getUpdatedAt());
        response.setClosedAt(incident.getClosedAt());
        response.setClosedBy(incident.getClosedByUser() != null ? incident.getClosedByUser().getUsername() : null);
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIncidentNumber() {
        return incidentNumber;
    }

    public void setIncidentNumber(String incidentNumber) {
        this.incidentNumber = incidentNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getEmployeeComment() {
        return employeeComment;
    }

    public void setEmployeeComment(String employeeComment) {
        this.employeeComment = employeeComment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(LocalDateTime closedAt) {
        this.closedAt = closedAt;
    }

    public String getClosedBy() {
        return closedBy;
    }

    public void setClosedBy(String closedBy) {
        this.closedBy = closedBy;
    }
}
