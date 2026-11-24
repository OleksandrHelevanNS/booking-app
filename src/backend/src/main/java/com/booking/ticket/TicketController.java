package com.booking.ticket;

import com.booking.plane.Plane;
import com.booking.plane.PlaneRepository;
import com.booking.user.Role;
import com.booking.user.User;
import com.booking.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    public record TicketRequest(
            @NotNull Long planeId,
            @NotBlank @Size(max = 10) String flightNumber,
            @NotBlank String origin,
            @NotBlank String destination,
            @NotNull LocalDateTime departureTime,
            @NotBlank @Size(max = 5) String seatNumber,
            @NotBlank String passengerName,
            @NotNull @DecimalMin("0.00") BigDecimal price) {
    }

    public record TicketResponse(
            Long id, Long planeId, String planeModel, String planeRegistration,
            String flightNumber, String origin, String destination, LocalDateTime departureTime,
            String seatNumber, String passengerName, BigDecimal price, String ownerEmail) {

        static TicketResponse of(Ticket t) {
            return new TicketResponse(t.getId(), t.getPlane().getId(), t.getPlane().getModel(),
                    t.getPlane().getRegistrationNumber(), t.getFlightNumber(), t.getOrigin(), t.getDestination(),
                    t.getDepartureTime(), t.getSeatNumber(), t.getPassengerName(), t.getPrice(),
                    t.getOwner().getEmail());
        }
    }

    private final TicketRepository tickets;
    private final PlaneRepository planes;
    private final UserRepository users;

    public TicketController(TicketRepository tickets, PlaneRepository planes, UserRepository users) {
        this.tickets = tickets;
        this.planes = planes;
        this.users = users;
    }

    /** Admins see all tickets, regular users see only their own. */
    @GetMapping
    @Transactional(readOnly = true)
    public List<TicketResponse> list(@AuthenticationPrincipal Jwt jwt) {
        User me = currentUser(jwt);
        List<Ticket> result = me.getRole() == Role.ADMIN
                ? tickets.findAllByOrderByDepartureTimeAsc()
                : tickets.findAllByOwnerIdOrderByDepartureTimeAsc(me.getId());
        return result.stream().map(TicketResponse::of).toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public TicketResponse get(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return TicketResponse.of(findAccessible(id, currentUser(jwt)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public TicketResponse create(@Valid @RequestBody TicketRequest req, @AuthenticationPrincipal Jwt jwt) {
        Ticket ticket = new Ticket();
        ticket.setOwner(currentUser(jwt));
        apply(ticket, req);
        return TicketResponse.of(saveChecked(ticket));
    }

    @PutMapping("/{id}")
    @Transactional
    public TicketResponse update(@PathVariable Long id, @Valid @RequestBody TicketRequest req,
                                 @AuthenticationPrincipal Jwt jwt) {
        Ticket ticket = findAccessible(id, currentUser(jwt));
        apply(ticket, req);
        return TicketResponse.of(saveChecked(ticket));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        tickets.delete(findAccessible(id, currentUser(jwt)));
    }

    private Ticket saveChecked(Ticket ticket) {
        try {
            return tickets.saveAndFlush(ticket);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Seat is already taken on this flight");
        }
    }

    private void apply(Ticket ticket, TicketRequest req) {
        Plane plane = planes.findById(req.planeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plane not found"));
        ticket.setPlane(plane);
        ticket.setFlightNumber(req.flightNumber().trim().toUpperCase());
        ticket.setOrigin(req.origin().trim());
        ticket.setDestination(req.destination().trim());
        ticket.setDepartureTime(req.departureTime());
        ticket.setSeatNumber(req.seatNumber().trim().toUpperCase());
        ticket.setPassengerName(req.passengerName().trim());
        ticket.setPrice(req.price());
    }

    private Ticket findAccessible(Long id, User me) {
        Ticket ticket = tickets.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
        if (me.getRole() != Role.ADMIN && !ticket.getOwner().getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
        }
        return ticket;
    }

    private User currentUser(Jwt jwt) {
        return users.findByEmailIgnoreCase(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
