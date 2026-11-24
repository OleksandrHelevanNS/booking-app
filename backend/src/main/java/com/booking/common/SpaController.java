package com.booking.common;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Forwards client-side React routes (e.g. /login, /tickets) to index.html.
 * Paths with a dot (static files), /api, /actuator and /h2-console are not matched.
 */
@Controller
public class SpaController {

    @GetMapping({
            "/{path:^(?!api|actuator|h2-console)[^.]*$}",
            "/{path:^(?!api|actuator|h2-console)[^.]*$}/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
