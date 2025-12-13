package com.blogapp.controller;

import com.blogapp.dto.BookmarkDTO;
import com.blogapp.model.Bookmark;
import com.blogapp.model.User;
import com.blogapp.repository.UserRepository;
import com.blogapp.service.BookmarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookmarks")
@CrossOrigin(origins = "http://localhost:3000")
public class BookmarkController {
    
    @Autowired
    private BookmarkService bookmarkService;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/toggle/{postId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long postId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Bookmark bookmark = bookmarkService.toggleBookmark(user.getId(), postId);
            boolean isBookmarked = bookmark != null;
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookmarked", isBookmarked);
            response.put("message", isBookmarked ? "Post bookmarked" : "Bookmark removed");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/check/{postId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> checkBookmark(@PathVariable Long postId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            boolean isBookmarked = bookmarkService.isBookmarked(user.getId(), postId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("bookmarked", isBookmarked);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserBookmarks() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(bookmarkService.getUserBookmarksDTO(user.getId()));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

