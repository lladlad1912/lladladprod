package com.blogapp.service;

import com.blogapp.dto.CommentDTO;
import com.blogapp.dto.PageResponse;
import com.blogapp.model.Comment;
import com.blogapp.model.Post;
import com.blogapp.model.User;
import com.blogapp.repository.CommentRepository;
import com.blogapp.repository.PostRepository;
import com.blogapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public PageResponse<CommentDTO> getCommentsByPost(Long postId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentPage = commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable);
        
        List<CommentDTO> content = commentPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return new PageResponse<>(
                content,
                commentPage.getNumber(),
                commentPage.getSize(),
                commentPage.getTotalElements(),
                commentPage.getTotalPages(),
                commentPage.isLast(),
                commentPage.isFirst()
        );
    }
    
    public List<CommentDTO> getAllCommentsByPost(Long postId) {
        // Get top-level comments (no parent)
        List<Comment> topLevelComments = commentRepository.findByPostIdAndParentIsNull(postId);
        return topLevelComments.stream()
                .map(comment -> convertToDTOWithReplies(comment))
                .collect(Collectors.toList());
    }
    
    public CommentDTO createComment(Long postId, Long userId, String content, Long parentId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Comment comment = new Comment();
        comment.setContent(content);
        comment.setPost(post);
        comment.setUser(user);
        
        // Set parent if this is a reply
        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parent);
        }
        
        Comment savedComment = commentRepository.save(comment);
        return convertToDTO(savedComment);
    }
    
    public CommentDTO createComment(Long postId, Long userId, String content) {
        return createComment(postId, userId, content, null);
    }
    
    public CommentDTO updateComment(Long id, String content) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
        
        comment.setContent(content);
        Comment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }
    
    public void deleteComment(Long id) {
        if (!commentRepository.existsById(id)) {
            throw new RuntimeException("Comment not found with id: " + id);
        }
        commentRepository.deleteById(id);
    }
    
    public long getCommentCount(Long postId) {
        return commentRepository.countByPostId(postId);
    }
    
    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setPostId(comment.getPost().getId());
        dto.setUserId(comment.getUser().getId());
        dto.setUsername(comment.getUser().getUsername());
        dto.setUserProfileImage(comment.getUser().getProfileImage());
        if (comment.getParent() != null) {
            dto.setParentId(comment.getParent().getId());
        }
        return dto;
    }
    
    private CommentDTO convertToDTOWithReplies(Comment comment) {
        CommentDTO dto = convertToDTO(comment);
        
        // Load and convert replies
        List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId());
        List<CommentDTO> replyDTOs = replies.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        dto.setReplies(replyDTOs);
        
        return dto;
    }
}



