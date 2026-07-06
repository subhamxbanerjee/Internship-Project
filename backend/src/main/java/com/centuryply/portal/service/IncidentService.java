package com.centuryply.portal.service;

import com.centuryply.portal.entity.Department;
import com.centuryply.portal.entity.Incident;
import com.centuryply.portal.entity.Priority;
import com.centuryply.portal.entity.Role;
import com.centuryply.portal.entity.Status;
import com.centuryply.portal.entity.User;
import com.centuryply.portal.repository.IncidentRepository;
import com.centuryply.portal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    public IncidentService(IncidentRepository incidentRepository, UserRepository userRepository) {
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
    }

    public List<Incident> getAllIncidentsForUser(String username) {
        User requester = resolveUser(username);
        if (requester.getRole() == Role.EMPLOYEE) {
            return incidentRepository.findAll().stream()
                .filter(incident -> incident.getAssignedToUser() != null && username.equals(incident.getAssignedToUser().getUsername()))
                .toList();
        }
        return incidentRepository.findAll();
    }

    public Optional<Incident> getIncidentByIdForUser(Long id, String username) {
        Incident incident = findIncidentOrThrow(id);
        User requester = resolveUser(username);
        if (requester.getRole() == Role.EMPLOYEE) {
            if (incident.getAssignedToUser() == null || !username.equals(incident.getAssignedToUser().getUsername())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employees can only view incidents assigned to them");
            }
        }
        return Optional.of(incident);
    }

    public Incident createIncident(String title, String description, Department department,
                                   Priority priority, String createdByUsername) {
        validateDepartment(department);
        validatePriority(priority);
        User creator = resolveUser(createdByUsername);
        if (creator.getRole() == Role.EMPLOYEE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employees cannot create incidents");
        }
        String incidentNumber = generateIncidentNumber();
        Incident incident = new Incident(
            incidentNumber,
            title,
            description,
            department,
            priority,
            Status.OPEN,
            creator
        );
        return incidentRepository.save(incident);
    }

    public Incident assignEmployee(Long id, String assignedToUsername, String actorUsername) {
        validateActorCanAssign(actorUsername);
        Incident incident = findIncidentOrThrow(id);
        User assignedUser = resolveUser(assignedToUsername);
        validateActiveUser(assignedUser);
        incident.setAssignedToUser(assignedUser);
        incident.setStatus(Status.IN_PROGRESS);
        incident.setUpdatedAt(LocalDateTime.now());
        return incidentRepository.save(incident);
    }

    public Incident updateStatus(Long id, Status status, String updatedByUsername) {
        Incident incident = findIncidentOrThrow(id);
        User updaters = resolveUser(updatedByUsername);
        validateStatus(status);
        validateStatusTransition(incident.getStatus(), status, updaters.getRole());
        incident.setStatus(status);
        incident.setUpdatedAt(LocalDateTime.now());

        if (status == Status.CLOSED) {
            incident.setClosedAt(LocalDateTime.now());
            incident.setClosedByUser(updaters);
        } else {
            incident.setClosedAt(null);
            incident.setClosedByUser(null);
        }

        return incidentRepository.save(incident);
    }

    public Incident updatePriority(Long id, Priority priority, String actorUsername) {
        validateActorCanChangePriority(actorUsername);
        Incident incident = findIncidentOrThrow(id);
        validatePriority(priority);
        incident.setPriority(priority);
        incident.setUpdatedAt(LocalDateTime.now());
        return incidentRepository.save(incident);
    }

    public Incident addComment(Long id, String comment, String actorUsername) {
        Incident incident = findIncidentOrThrow(id);
        User requester = resolveUser(actorUsername);
        if (requester.getRole() == Role.EMPLOYEE) {
            if (incident.getAssignedToUser() == null || !actorUsername.equals(incident.getAssignedToUser().getUsername())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employees can only comment on incidents assigned to them");
            }
        }
        incident.setEmployeeComment(comment);
        incident.setUpdatedAt(LocalDateTime.now());
        return incidentRepository.save(incident);
    }

    public Incident closeIncident(Long id, String closedByUsername) {
        User closer = resolveUser(closedByUsername);
        if (closer.getRole() == Role.EMPLOYEE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employees cannot close incidents");
        }
        Incident incident = findIncidentOrThrow(id);
        incident.setStatus(Status.CLOSED);
        incident.setClosedAt(LocalDateTime.now());
        incident.setClosedByUser(closer);
        incident.setUpdatedAt(LocalDateTime.now());
        return incidentRepository.save(incident);
    }

    public void deleteIncident(Long id, String actorUsername) {
        User actor = resolveUser(actorUsername);
        if (actor.getRole() == Role.EMPLOYEE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employees cannot delete incidents");
        }
        incidentRepository.deleteById(id);
    }

    private Incident findIncidentOrThrow(Long id) {
        return incidentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));
    }

    private User resolveUser(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username));
    }

    private void validateDepartment(Department department) {
        if (department == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department is required");
        }
    }

    private void validatePriority(Priority priority) {
        if (priority == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Priority is required");
        }
    }

    private void validateStatus(Status status) {
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }
    }

    private void validateActiveUser(User user) {
        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned user is inactive");
        }
    }

    private void validateActorCanAssign(String username) {
        User actor = resolveUser(username);
        if (actor.getRole() == Role.EMPLOYEE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employees cannot assign incidents");
        }
    }

    private void validateActorCanChangePriority(String username) {
        User actor = resolveUser(username);
        if (actor.getRole() == Role.EMPLOYEE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employees cannot change priority");
        }
    }

    private void validateStatusTransition(Status current, Status next, Role actorRole) {
        if (current == null || next == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }
        if (current == next) {
            return;
        }
        if (actorRole == Role.EMPLOYEE) {
            if (current == Status.OPEN && next == Status.IN_PROGRESS) {
                return;
            }
            if (current == Status.IN_PROGRESS && next == Status.PENDING_REVIEW) {
                return;
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Employees can only move OPEN -> IN_PROGRESS -> PENDING_REVIEW");
        }
        if (current == Status.PENDING_REVIEW && next == Status.CLOSED) {
            return;
        }
        // Admins and super admins can update to any non-closed transition as long as it remains within allowed statuses.
        if (next == Status.OPEN || next == Status.IN_PROGRESS || next == Status.PENDING_REVIEW || next == Status.CLOSED) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Invalid status transition");
    }

    private String generateIncidentNumber() {
        long count = incidentRepository.count();
        return String.format("CPLY%04d", count + 1);
    }
}
