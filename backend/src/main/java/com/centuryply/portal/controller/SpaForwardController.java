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
            "/users",
            "/incidents",
            "/settings"
    })
    public String forward() {
        return "forward:/index.html";
    }
}