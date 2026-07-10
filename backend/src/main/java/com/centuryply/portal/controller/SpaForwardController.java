package com.centuryply.portal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

   @GetMapping({
        "/",
        "/login",
        "/dashboard",
        "/documents",
        "/upload",
        "/users",
        "/incidents",
        "/incidents/report",
        "/settings"
})
public String forward() {
    return "forward:/index.html";
}
}