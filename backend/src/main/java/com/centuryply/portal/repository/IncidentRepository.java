package com.centuryply.portal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.centuryply.portal.entity.Incident;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    Optional<Incident> findByIncidentNumber(String incidentNumber);

    List<Incident> findByAssignedToUser_Username(String username);

    Optional<Incident> findTopByOrderByIdDesc();
}