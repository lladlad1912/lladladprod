package com.blogapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    public void sendEmail(String to, String subject, String text) {
        if (mailSender == null) {
            System.out.println("Email service not configured. Would send email to: " + to);
            System.out.println("Subject: " + subject);
            System.out.println("Body: " + text);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
    }
    
    public void sendWelcomeEmail(String to, String username) {
        String subject = "Welcome to Blog Application!";
        String text = "Hello " + username + ",\n\n" +
                      "Welcome to our blog application! We're excited to have you here.\n\n" +
                      "Happy blogging!\n\n" +
                      "Best regards,\n" +
                      "Blog App Team";
        sendEmail(to, subject, text);
    }
    
    public void sendNewPostNotification(String to, String authorName, String postTitle) {
        String subject = "New Post: " + postTitle;
        String text = "Hello,\n\n" +
                      authorName + " has published a new post: " + postTitle + "\n\n" +
                      "Check it out on our blog!\n\n" +
                      "Best regards,\n" +
                      "Blog App Team";
        sendEmail(to, subject, text);
    }
}
















