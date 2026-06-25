package com.blogapp.controller;

import com.blogapp.dto.PageResponse;
import com.blogapp.dto.PostDTO;
import com.blogapp.model.Post;
import com.blogapp.service.PostService;
import com.blogapp.service.PostViewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    
    @Autowired
    private PostService postService;
    
    @Autowired
    private PostViewService postViewService;
    
    @GetMapping
    public ResponseEntity<?> getAllPosts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            Authentication authentication) {
        String userRole = getUserRole(authentication);
        
        if (page != null && size != null) {
            PageResponse<PostDTO> posts = postService.getAllPosts(page, size, userRole);
            return ResponseEntity.ok(posts);
        } else {
            List<PostDTO> posts = postService.getAllPosts(userRole);
            return ResponseEntity.ok(posts);
        }
    }
    
    private String getUserRole(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return authentication.getAuthorities().stream()
                .filter(auth -> auth.getAuthority().startsWith("ROLE_"))
                .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .orElse(null);
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
            @RequestParam(required = false) Integer size,
            Authentication authentication) {
        String userRole = getUserRole(authentication);
        
        if (page != null && size != null) {
            PageResponse<PostDTO> posts = postService.getPostsByCategory(categoryId, page, size, userRole);
            return ResponseEntity.ok(posts);
        } else {
            List<PostDTO> posts = postService.getPostsByCategory(categoryId, userRole);
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
            if (request.containsKey("hashtags")) {
                post.setHashtags((String) request.get("hashtags"));
            }
            if (request.containsKey("metaTitle")) {
                post.setMetaTitle((String) request.get("metaTitle"));
            }
            if (request.containsKey("metaDescription")) {
                post.setMetaDescription((String) request.get("metaDescription"));
            }
            if (request.containsKey("metaKeywords")) {
                post.setMetaKeywords((String) request.get("metaKeywords"));
            }
            
            Long userId = Long.valueOf(request.get("userId").toString());
            Long categoryId = Long.valueOf(request.get("categoryId").toString());
            Long subCategoryId = request.containsKey("subCategoryId") && request.get("subCategoryId") != null 
                ? Long.valueOf(request.get("subCategoryId").toString()) : null;
            
            PostDTO createdPost = postService.createPost(post, userId, categoryId, subCategoryId);
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
            if (request.containsKey("hashtags")) {
                postDetails.setHashtags((String) request.get("hashtags"));
            }
            if (request.containsKey("metaTitle")) {
                postDetails.setMetaTitle((String) request.get("metaTitle"));
            }
            if (request.containsKey("metaDescription")) {
                postDetails.setMetaDescription((String) request.get("metaDescription"));
            }
            if (request.containsKey("metaKeywords")) {
                postDetails.setMetaKeywords((String) request.get("metaKeywords"));
            }
            if (request.containsKey("categoryId")) {
                com.blogapp.model.Category category = new com.blogapp.model.Category();
                category.setId(Long.valueOf(request.get("categoryId").toString()));
                postDetails.setCategory(category);
            }
            if (request.containsKey("subCategoryId") && request.get("subCategoryId") != null) {
                com.blogapp.model.SubCategory subCategory = new com.blogapp.model.SubCategory();
                subCategory.setId(Long.valueOf(request.get("subCategoryId").toString()));
                postDetails.setSubCategory(subCategory);
            } else if (request.containsKey("subCategoryId") && request.get("subCategoryId") == null) {
                postDetails.setSubCategory(null);
            }
            
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            
            PostDTO updatedPost = postService.updatePost(id, postDetails, currentUsername, request);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            
            postService.deletePost(id, currentUsername);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
    
    @PostMapping("/{id}/view")
    public ResponseEntity<?> incrementView(
            @PathVariable Long id,
            HttpServletRequest request,
            @RequestParam(required = false) Long userId) {
        try {
            postViewService.trackPostView(id, userId, request, null, null, null);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    public ResponseEntity<?> approvePost(@PathVariable Long id) {
        try {
            PostDTO post = postService.approvePost(id);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    public ResponseEntity<?> rejectPost(@PathVariable Long id) {
        try {
            PostDTO post = postService.rejectPost(id);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/pending-review")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    public ResponseEntity<?> getPendingReviewPosts() {
        try {
            List<PostDTO> posts = postService.getPostsByStatus("PENDING_REVIEW");
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/for-review")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    public ResponseEntity<?> getPostsForReview() {
        try {
            // Return all posts for admin/editor to review (all statuses)
            List<PostDTO> posts = postService.getAllPosts("ADMIN");
            return ResponseEntity.ok(posts);
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

