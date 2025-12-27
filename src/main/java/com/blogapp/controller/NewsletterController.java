package com.blogapp.controller;

import com.blogapp.model.User;
import com.blogapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
@CrossOrigin(origins = "http://localhost:3000")
public class NewsletterController {

    private final UserRepository userRepository;

    public NewsletterController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        User user = currentUser();
        Map<String, Object> out = new HashMap<>();
        out.put("subscribed", Boolean.TRUE.equals(user.getNewsletterSubscribed()));
        out.put("subscribedAt", user.getNewsletterSubscribedAt());
        return ResponseEntity.ok(out);
    }

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, Object>> subscribe() {
        User user = currentUser();
        if (!Boolean.TRUE.equals(user.getNewsletterSubscribed())) {
            user.setNewsletterSubscribed(true);
            user.setNewsletterSubscribedAt(LocalDateTime.now());
            userRepository.save(user);
        }
        Map<String, Object> out = new HashMap<>();
        out.put("subscribed", true);
        out.put("subscribedAt", user.getNewsletterSubscribedAt());
        return ResponseEntity.ok(out);
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Not authenticated");
        }
        String username = auth.getName();
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
    }
}











