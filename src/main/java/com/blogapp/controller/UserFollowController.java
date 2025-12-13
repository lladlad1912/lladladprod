package com.blogapp.controller;

import com.blogapp.model.User;
import com.blogapp.repository.UserRepository;
import com.blogapp.service.UserFollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/follows")
@CrossOrigin(origins = "http://localhost:3000")
public class UserFollowController {
    
    @Autowired
    private UserFollowService userFollowService;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/toggle/{followingId}")
    @PreAuthorize("hasAnyRole('USER', 'EDITOR', 'ADMIN')")
    public ResponseEntity<?> toggleFollow(@PathVariable Long followingId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            String username = authentication.getName();
            User follower = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            boolean isFollowing = userFollowService.toggleFollow(follower.getId(), followingId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("following", isFollowing);
            response.put("message", isFollowing ? "User followed" : "User unfollowed");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/check/{followingId}")
    @PreAuthorize("hasAnyRole('USER', 'EDITOR', 'ADMIN')")
    public ResponseEntity<?> checkFollow(@PathVariable Long followingId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            String username = authentication.getName();
            User follower = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            boolean isFollowing = userFollowService.isFollowing(follower.getId(), followingId);
            return ResponseEntity.ok(Map.of("following", isFollowing));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/count/{userId}")
    public ResponseEntity<?> getFollowCounts(@PathVariable Long userId) {
        try {
            long followingCount = userFollowService.getFollowingCount(userId);
            long followersCount = userFollowService.getFollowersCount(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("following", followingCount);
            response.put("followers", followersCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}




