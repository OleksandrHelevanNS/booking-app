package com.booking.ticket;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @EntityGraph(attributePaths = {"plane", "owner"})
    List<Ticket> findAllByOrderByDepartureTimeAsc();

    @EntityGraph(attributePaths = {"plane", "owner"})
    List<Ticket> findAllByOwnerIdOrderByDepartureTimeAsc(Long ownerId);

    boolean existsByPlaneId(Long planeId);
}
