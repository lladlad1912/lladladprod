package com.blogapp.controller;

import com.blogapp.service.PostLikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "http://localhost:3000")
public class PostLikeController {
    
    @Autowired
    private PostLikeService postLikeService;
    
    @PostMapping("/toggle")
    public ResponseEntity<?> toggleLike(@RequestBody Map<String, Object> request) {
        try {
            Long postId = Long.valueOf(request.get("postId").toString());
            Long userId = Long.valueOf(request.get("userId").toString());
            
            boolean isLiked = postLikeService.toggleLike(postId, userId);
            return ResponseEntity.ok(Map.of("liked", isLiked));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/post/{postId}/user/{userId}")
    public ResponseEntity<?> isLiked(@PathVariable Long postId, @PathVariable Long userId) {
        boolean isLiked = postLikeService.isLiked(postId, userId);
        return ResponseEntity.ok(Map.of("liked", isLiked));
    }
    
    @GetMapping("/post/{postId}/count")
    public ResponseEntity<?> getLikeCount(@PathVariable Long postId) {
        long count = postLikeService.getLikeCount(postId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}



























