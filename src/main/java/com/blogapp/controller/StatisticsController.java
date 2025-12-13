package com.blogapp.controller;

import com.blogapp.dto.PostStatisticsDTO;
import com.blogapp.model.Post;
import com.blogapp.model.User;
import com.blogapp.repository.PostRepository;
import com.blogapp.repository.UserRepository;
import com.blogapp.service.PostViewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "http://localhost:3000")
public class StatisticsController {
    
    @Autowired
    private PostViewService postViewService;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/posts")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR', 'USER')")
    public ResponseEntity<List<PostStatisticsDTO>> getAllPostsStatistics(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<PostStatisticsDTO> stats;
        
        // Admin and Editor see all posts, regular users see only their own posts
        if (user.getRole() != null && (user.getRole().equals("ADMIN") || user.getRole().equals("EDITOR"))) {
            stats = postViewService.getAllPostsStatistics();
        } else {
            // Regular users see only their own posts
            stats = postRepository.findByAuthorId(user.getId()).stream()
                    .map(post -> {
                        PostStatisticsDTO postStats = new PostStatisticsDTO();
                        postStats.setPostId(post.getId());
                        postStats.setPostTitle(post.getTitle());
                        postStats.setTotalViews(postViewService.getPostStatistics(post.getId()).getTotalViews());
                        postStats.setUniqueVisitors(postViewService.getPostStatistics(post.getId()).getUniqueVisitors());
                        return postStats;
                    })
                    .collect(Collectors.toList());
        }
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/posts/{postId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR', 'USER')")
    public ResponseEntity<PostStatisticsDTO> getPostStatistics(@PathVariable Long postId, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user has permission to view this post's statistics
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Admin and Editor can see all posts, regular users can only see their own posts
        if (user.getRole() != null && (user.getRole().equals("ADMIN") || user.getRole().equals("EDITOR"))) {
            PostStatisticsDTO stats = postViewService.getPostStatistics(postId);
            return ResponseEntity.ok(stats);
        } else {
            // Regular users can only see their own posts
            if (!post.getAuthor().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(null);
            }
            PostStatisticsDTO stats = postViewService.getPostStatistics(postId);
            return ResponseEntity.ok(stats);
        }
    }
}

