package com.centuryply.portal.dto;

import jakarta.validation.constraints.NotBlank;

public class AssignIncidentRequest {

    @NotBlank(message = "Assigned employee is required")
    private String assignedTo;

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }
}