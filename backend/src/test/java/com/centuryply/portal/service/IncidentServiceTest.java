package com.centuryply.portal.service;

import com.centuryply.portal.entity.Department;
import com.centuryply.portal.entity.Incident;
import com.centuryply.portal.entity.Priority;
import com.centuryply.portal.entity.Role;
import com.centuryply.portal.entity.Status;
import com.centuryply.portal.entity.User;
import com.centuryply.portal.repository.IncidentRepository;
import com.centuryply.portal.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private IncidentService incidentService;

   @Test
void createIncidentShouldAttachCreatedByUser() {
    User creator = new User("superadmin", "password", "Super Admin", "admin@centuryply.com", Role.SUPER_ADMIN);
    creator.setId(1L);

    when(userRepository.findByUsername("superadmin"))
            .thenReturn(Optional.of(creator));

    when(incidentRepository.findTopByOrderByIdDesc())
            .thenReturn(Optional.empty());

    when(incidentRepository.save(any(Incident.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

    Incident incident = incidentService.createIncident(
            "Login failure",
            "Users unable to login",
            Department.IT,
            Priority.HIGH,
            "superadmin"
    );

    assertThat(incident.getCreatedByUser()).isNotNull();
    assertThat(incident.getCreatedByUser().getUsername()).isEqualTo("superadmin");
    assertThat(incident.getIncidentNumber()).isEqualTo("CPLY0001");
}

    @Test
    void employeeShouldOnlySeeAssignedIncidents() {
        User employee = new User("employee", "password", "Employee User", "employee@centuryply.com", Role.EMPLOYEE);
        employee.setId(2L);

        User otherEmployee = new User("other", "password", "Other User", "other@centuryply.com", Role.EMPLOYEE);
        otherEmployee.setId(3L);

        Incident assignedIncident = new Incident("CPLY0001", "Assigned issue", "Needs attention", Department.IT, Priority.HIGH, Status.OPEN, employee);
        assignedIncident.setAssignedToUser(employee);

        Incident otherIncident = new Incident("CPLY0002", "Other issue", "Needs attention", Department.IT, Priority.MEDIUM, Status.OPEN, otherEmployee);
        otherIncident.setAssignedToUser(otherEmployee);

        when(userRepository.findByUsername("employee")).thenReturn(Optional.of(employee));
        when(incidentRepository.findByAssignedToUser_Username("employee")).thenReturn(List.of(assignedIncident));

        List<Incident> visibleIncidents = incidentService.getAllIncidentsForUser("employee");

        assertThat(visibleIncidents).hasSize(1);
        assertThat(visibleIncidents.get(0).getIncidentNumber()).isEqualTo("CPLY0001");
    }
}
