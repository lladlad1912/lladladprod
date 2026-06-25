package com.blogapp.controller;

import com.blogapp.model.ContactSubmission;
import com.blogapp.service.ContactSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {
    
    @Autowired
    private ContactSubmissionService contactService;
    
    @PostMapping("/submit")
    public ResponseEntity<?> submitContact(@RequestBody ContactSubmission submission) {
        ContactSubmission saved = contactService.createSubmission(submission);
        return ResponseEntity.ok(Map.of("success", true, "message", "Thank you for your submission! We'll get back to you soon."));
    }
    
    @GetMapping("/submissions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContactSubmission>> getAllSubmissions() {
        return ResponseEntity.ok(contactService.getAllSubmissions());
    }
    
    @GetMapping("/submissions/unread")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContactSubmission>> getUnreadSubmissions() {
        return ResponseEntity.ok(contactService.getUnreadSubmissions());
    }
    
    @PutMapping("/submissions/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContactSubmission> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.markAsRead(id));
    }
    
    @DeleteMapping("/submissions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSubmission(@PathVariable Long id) {
        contactService.deleteSubmission(id);
        return ResponseEntity.noContent().build();
    }
}


























