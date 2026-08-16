package com.blogapp.controller;

import com.blogapp.dto.PostStatisticsDTO;
import com.blogapp.model.Post;
import com.blogapp.model.User;
import com.blogapp.repository.PostRepository;
import com.blogapp.repository.UserRepository;
import com.blogapp.service.PostViewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {
    
    @Autowired
    private PostViewService postViewService;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPostsStatistics(Authentication authentication) {
        try {
            User user = requireUser(authentication);
            if (user == null) {
                return ResponseEntity.status(401).body("Login required to view statistics");
            }
            List<PostStatisticsDTO> stats = isStaff(user)
                    ? postViewService.getAllPostsStatistics()
                    : postViewService.getAuthorPostsStatistics(user.getId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to load statistics: " + e.getMessage());
        }
    }
    
    @GetMapping("/posts/{postId}")
    public ResponseEntity<?> getPostStatistics(@PathVariable Long postId, Authentication authentication) {
        try {
            User user = requireUser(authentication);
            if (user == null) {
                return ResponseEntity.status(401).body("Login required to view statistics");
            }
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            
            if (!isStaff(user) && !post.getAuthor().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("You can only view statistics for your own posts");
            }
            return ResponseEntity.ok(postViewService.getPostStatistics(postId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to load post statistics: " + e.getMessage());
        }
    }

    private User requireUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        String name = authentication.getName();
        return userRepository.findByUsername(name)
                .or(() -> userRepository.findByEmail(name))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private boolean isStaff(User user) {
        return user.getRole() != null
                && (user.getRole().equals("ADMIN") || user.getRole().equals("EDITOR"));
    }
}

