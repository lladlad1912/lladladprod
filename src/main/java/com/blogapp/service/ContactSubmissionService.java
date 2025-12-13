package com.blogapp.service;

import com.blogapp.model.ContactSubmission;
import com.blogapp.repository.ContactSubmissionRepository;
import com.blogapp.repository.SiteSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ContactSubmissionService {
    
    @Autowired
    private ContactSubmissionRepository submissionRepository;
    
    @Autowired
    private SiteSettingsRepository settingsRepository;
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    public ContactSubmission createSubmission(ContactSubmission submission) {
        ContactSubmission saved = submissionRepository.save(submission);
        
        // Send email notification to admin
        try {
            String adminEmail = settingsRepository.findByKey("contact_email")
                    .map(s -> s.getValue())
                    .orElse("admin@lladlad.com");
            
            if (mailSender != null && adminEmail != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(adminEmail);
                message.setSubject("New Contact Submission: " + submission.getSubject());
                message.setText("Name: " + submission.getName() + "\n" +
                              "Email: " + submission.getEmail() + "\n" +
                              "Type: " + submission.getSubmissionType() + "\n\n" +
                              "Message:\n" + submission.getMessage());
                mailSender.send(message);
            }
        } catch (Exception e) {
            // Log error but don't fail submission
            System.err.println("Failed to send email notification: " + e.getMessage());
        }
        
        return saved;
    }
    
    public List<ContactSubmission> getAllSubmissions() {
        return submissionRepository.findByOrderByCreatedAtDesc();
    }
    
    public List<ContactSubmission> getUnreadSubmissions() {
        return submissionRepository.findByIsReadFalseOrderByCreatedAtDesc();
    }
    
    public ContactSubmission markAsRead(Long id) {
        ContactSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        submission.setIsRead(true);
        return submissionRepository.save(submission);
    }
    
    public void deleteSubmission(Long id) {
        submissionRepository.deleteById(id);
    }
}












