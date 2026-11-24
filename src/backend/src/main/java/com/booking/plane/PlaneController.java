package com.booking.plane;

import com.booking.ticket.TicketRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/planes")
public class PlaneController {

    public record PlaneRequest(
            @NotBlank String model,
            @NotBlank String registrationNumber,
            @Min(1) @Max(1000) int capacity,
            @NotBlank String airline) {
    }

    private final PlaneRepository planes;
    private final TicketRepository tickets;

    public PlaneController(PlaneRepository planes, TicketRepository tickets) {
        this.planes = planes;
        this.tickets = tickets;
    }

    @GetMapping
    public List<Plane> list() {
        return planes.findAll();
    }

    @GetMapping("/{id}")
    public Plane get(@PathVariable Long id) {
        return find(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public Plane create(@Valid @RequestBody PlaneRequest req) {
        if (planes.existsByRegistrationNumberIgnoreCase(req.registrationNumber().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Registration number already exists");
        }
        Plane plane = new Plane();
        apply(plane, req);
        return planes.save(plane);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Plane update(@PathVariable Long id, @Valid @RequestBody PlaneRequest req) {
        Plane plane = find(id);
        if (planes.existsByRegistrationNumberIgnoreCaseAndIdNot(req.registrationNumber().trim(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Registration number already exists");
        }
        apply(plane, req);
        return planes.save(plane);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        Plane plane = find(id);
        if (tickets.existsByPlaneId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Plane has tickets; delete them first");
        }
        planes.delete(plane);
    }

    private Plane find(Long id) {
        return planes.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plane not found"));
    }

    private static void apply(Plane plane, PlaneRequest req) {
        plane.setModel(req.model().trim());
        plane.setRegistrationNumber(req.registrationNumber().trim().toUpperCase());
        plane.setCapacity(req.capacity());
        plane.setAirline(req.airline().trim());
    }
}
