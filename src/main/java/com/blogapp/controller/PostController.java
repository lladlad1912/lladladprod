package com.blogapp.controller;

import com.blogapp.dto.PageResponse;
import com.blogapp.dto.PostDTO;
import com.blogapp.model.Post;
import com.blogapp.service.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {
    
    @Autowired
    private PostService postService;
    
    @GetMapping
    public ResponseEntity<?> getAllPosts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page != null && size != null) {
            PageResponse<PostDTO> posts = postService.getAllPosts(page, size);
            return ResponseEntity.ok(posts);
        } else {
            List<PostDTO> posts = postService.getAllPosts();
            return ResponseEntity.ok(posts);
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<PageResponse<PostDTO>> searchPosts(
            @RequestParam String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<PostDTO> posts = postService.searchPosts(keyword, categoryId, page, size);
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        try {
            PostDTO post = userId != null 
                    ? postService.getPostById(id, userId)
                    : postService.getPostById(id);
            return ResponseEntity.ok(post);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getPostsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page != null && size != null) {
            PageResponse<PostDTO> posts = postService.getPostsByCategory(categoryId, page, size);
            return ResponseEntity.ok(posts);
        } else {
            List<PostDTO> posts = postService.getPostsByCategory(categoryId);
            return ResponseEntity.ok(posts);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUser(
            @PathVariable Long userId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page != null && size != null) {
            PageResponse<PostDTO> posts = postService.getPostsByUser(userId, page, size);
            return ResponseEntity.ok(posts);
        } else {
            List<PostDTO> posts = postService.getPostsByUser(userId);
            return ResponseEntity.ok(posts);
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createPost(@Valid @RequestBody Map<String, Object> request) {
        try {
            Post post = new Post();
            post.setTitle((String) request.get("title"));
            post.setContent((String) request.get("content"));
            post.setYoutubeUrl((String) request.get("youtubeUrl"));
            if (request.containsKey("imagePath")) {
                post.setImagePath((String) request.get("imagePath"));
            }
            
            Long userId = Long.valueOf(request.get("userId").toString());
            Long categoryId = Long.valueOf(request.get("categoryId").toString());
            
            PostDTO createdPost = postService.createPost(post, userId, categoryId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Post postDetails = new Post();
            if (request.containsKey("title")) {
                postDetails.setTitle((String) request.get("title"));
            }
            if (request.containsKey("content")) {
                postDetails.setContent((String) request.get("content"));
            }
            if (request.containsKey("youtubeUrl")) {
                postDetails.setYoutubeUrl((String) request.get("youtubeUrl"));
            }
            if (request.containsKey("imagePath")) {
                postDetails.setImagePath((String) request.get("imagePath"));
            }
            if (request.containsKey("categoryId")) {
                com.blogapp.model.Category category = new com.blogapp.model.Category();
                category.setId(Long.valueOf(request.get("categoryId").toString()));
                postDetails.setCategory(category);
            }
            
            PostDTO updatedPost = postService.updatePost(id, postDetails);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        try {
            postService.deletePost(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{id}/view")
    public ResponseEntity<?> incrementView(@PathVariable Long id) {
        try {
            postService.incrementViewCount(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/stats/total-views")
    public ResponseEntity<?> getTotalSiteViews() {
        try {
            long totalViews = postService.getTotalSiteViews();
            return ResponseEntity.ok(Map.of("totalViews", totalViews));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

