package com.blogapp.controller;

import com.blogapp.dto.CommentDTO;
import com.blogapp.dto.PageResponse;
import com.blogapp.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    @GetMapping("/post/{postIdOrSlug}")
    public ResponseEntity<PageResponse<CommentDTO>> getCommentsByPost(
            @PathVariable String postIdOrSlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<CommentDTO> comments = commentService.getCommentsByPost(postIdOrSlug, page, size);
        return ResponseEntity.ok(comments);
    }
    
    @GetMapping("/post/{postIdOrSlug}/all")
    public ResponseEntity<?> getAllCommentsByPost(@PathVariable String postIdOrSlug) {
        try {
            return ResponseEntity.ok(commentService.getAllCommentsByPost(postIdOrSlug));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            Object postIdValue = request.get("postId");
            if (postIdValue == null) {
                return ResponseEntity.badRequest().body("postId is required");
            }
            String content = (String) request.get("content");
            Long parentId = request.containsKey("parentId") && request.get("parentId") != null 
                    ? Long.valueOf(request.get("parentId").toString()) 
                    : null;
            String guestName = request.get("guestName") != null ? request.get("guestName").toString() : null;
            String guestKey = request.get("guestKey") != null ? request.get("guestKey").toString() : null;

            CommentDTO comment = commentService.createComment(
                    postIdValue.toString(),
                    content,
                    parentId,
                    currentUsername(authentication),
                    guestName,
                    guestKey
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            CommentDTO updatedComment = commentService.updateComment(
                    id,
                    request.get("content"),
                    currentUsername(authentication),
                    request.get("guestKey")
            );
            return ResponseEntity.ok(updatedComment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request,
            @RequestParam(required = false) String guestKey,
            Authentication authentication) {
        try {
            String key = guestKey;
            if ((key == null || key.isBlank()) && request != null) {
                key = request.get("guestKey");
            }
            commentService.deleteComment(id, currentUsername(authentication), key);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    private String currentUsername(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        return authentication.getName();
    }
}
