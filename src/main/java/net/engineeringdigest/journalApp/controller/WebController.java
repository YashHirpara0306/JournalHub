package net.engineeringdigest.journalApp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/")
    public String index() {
        return "redirect:/index.html"; // Redirect to static index.html
    }

    @GetMapping("/login")
    public String login() {
        return "redirect:/login.html"; // Redirect to static login.html
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard"; // This will serve the template dashboard.html
    }
    
    @GetMapping("/register")
    public String register() {
        return "redirect:/register.html";
    }
    
    @GetMapping("/about")
    public String about() {
        return "redirect:/about.html";
    }
    
    @GetMapping("/features")
    public String features() {
        return "redirect:/features.html";
    }
    
    @GetMapping("/contact")
    public String contact() {
        return "redirect:/contact.html";
    }
    
    @GetMapping("/security")
    public String security() {
        return "redirect:/security.html";
    }
    
    @GetMapping("/mobile")
    public String mobile() {
        return "redirect:/mobile.html";
    }
    
    @GetMapping("/pricing")
    public String pricing() {
        return "redirect:/pricing.html";
    }
    
    @GetMapping("/blog")
    public String blog() {
        return "redirect:/blog.html";
    }
    
    @GetMapping("/careers")
    public String careers() {
        return "redirect:/careers.html";
    }
} 