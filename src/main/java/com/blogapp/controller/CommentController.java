package com.blogapp.controller;

import com.blogapp.dto.CommentDTO;
import com.blogapp.dto.PageResponse;
import com.blogapp.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:3000")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    @GetMapping("/post/{postId}")
    public ResponseEntity<PageResponse<CommentDTO>> getCommentsByPost(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<CommentDTO> comments = commentService.getCommentsByPost(postId, page, size);
        return ResponseEntity.ok(comments);
    }
    
    @GetMapping("/post/{postId}/all")
    public ResponseEntity<List<CommentDTO>> getAllCommentsByPost(@PathVariable Long postId) {
        List<CommentDTO> comments = commentService.getAllCommentsByPost(postId);
        return ResponseEntity.ok(comments);
    }
    
    @PostMapping
    public ResponseEntity<?> createComment(@Valid @RequestBody Map<String, Object> request) {
        try {
            Long postId = Long.valueOf(request.get("postId").toString());
            Long userId = Long.valueOf(request.get("userId").toString());
            String content = (String) request.get("content");
            Long parentId = request.containsKey("parentId") && request.get("parentId") != null 
                    ? Long.valueOf(request.get("parentId").toString()) 
                    : null;
            
            CommentDTO comment = commentService.createComment(postId, userId, content, parentId);
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            CommentDTO updatedComment = commentService.updateComment(id, request.get("content"));
            return ResponseEntity.ok(updatedComment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        try {
            commentService.deleteComment(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}



