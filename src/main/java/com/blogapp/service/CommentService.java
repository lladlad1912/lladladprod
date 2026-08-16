package com.blogapp.service;

import com.blogapp.dto.CommentDTO;
import com.blogapp.dto.PageResponse;
import com.blogapp.model.Comment;
import com.blogapp.model.Post;
import com.blogapp.model.User;
import com.blogapp.repository.CommentRepository;
import com.blogapp.repository.PostRepository;
import com.blogapp.repository.UserRepository;
import com.blogapp.util.GuestIdentity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${jwt.secret}")
    private String guestPepper;

    private Long resolvePostId(String postIdOrSlug) {
        if (postIdOrSlug != null && postIdOrSlug.matches("\\d+")) {
            Long id = Long.parseLong(postIdOrSlug);
            if (postRepository.existsById(id)) {
                return id;
            }
        }
        return postRepository.findBySlug(postIdOrSlug)
                .map(Post::getId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postIdOrSlug));
    }
    
    public PageResponse<CommentDTO> getCommentsByPost(String postIdOrSlug, int page, int size) {
        return getCommentsByPost(resolvePostId(postIdOrSlug), page, size);
    }

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
    
    public List<CommentDTO> getAllCommentsByPost(String postIdOrSlug) {
        return getAllCommentsByPost(resolvePostId(postIdOrSlug));
    }

    public List<CommentDTO> getAllCommentsByPost(Long postId) {
        // Verify post exists
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("Post not found with id: " + postId);
        }
        
        // Get top-level comments (no parent)
        List<Comment> topLevelComments = commentRepository.findByPostIdAndParentIsNull(postId);
        return topLevelComments.stream()
                .map(comment -> convertToDTOWithReplies(comment))
                .collect(Collectors.toList());
    }
    
    public CommentDTO createComment(String postIdOrSlug, String content, Long parentId,
                                    String currentUsername, String guestName, String guestKey) {
        Long postId = resolvePostId(postIdOrSlug);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        if (content == null || content.isBlank()) {
            throw new RuntimeException("Comment content is required");
        }

        Comment comment = new Comment();
        comment.setContent(content.trim());
        comment.setPost(post);

        if (currentUsername != null) {
            User user = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            comment.setUser(user);
        } else {
            applyGuestIdentity(comment, guestName, guestKey);
        }

        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parent);
        }

        return convertToDTO(commentRepository.save(comment));
    }

    public CommentDTO createComment(Long postId, Long userId, String content, Long parentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return createComment(String.valueOf(postId), content, parentId, user.getUsername(), null, null);
    }
    
    public CommentDTO createComment(Long postId, Long userId, String content) {
        return createComment(postId, userId, content, null);
    }
    
    public CommentDTO updateComment(Long id, String content, String currentUsername, String guestKey) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
        assertCanManage(comment, currentUsername, guestKey);
        if (content == null || content.isBlank()) {
            throw new RuntimeException("Comment content is required");
        }
        comment.setContent(content.trim());
        return convertToDTO(commentRepository.save(comment));
    }
    
    public void deleteComment(Long id, String currentUsername, String guestKey) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
        assertCanManage(comment, currentUsername, guestKey);
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
        if (comment.getUser() != null) {
            dto.setUserId(comment.getUser().getId());
            dto.setUsername(comment.getUser().getUsername());
            dto.setUserProfileImage(comment.getUser().getProfileImage());
            dto.setGuest(false);
        } else {
            dto.setUsername(comment.getGuestName());
            dto.setGuest(true);
        }
        if (comment.getParent() != null) {
            dto.setParentId(comment.getParent().getId());
        }
        return dto;
    }
    
    private CommentDTO convertToDTOWithReplies(Comment comment) {
        CommentDTO dto = convertToDTO(comment);
        
        // Load and convert replies recursively
        List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId());
        List<CommentDTO> replyDTOs = replies.stream()
                .map(this::convertToDTOWithReplies)  // Recursive call to handle nested replies
                .collect(Collectors.toList());
        dto.setReplies(replyDTOs);
        
        return dto;
    }

    private void applyGuestIdentity(Comment comment, String guestName, String guestKey) {
        String name = GuestIdentity.normalizeName(guestName);
        if (name.length() < 2 || name.length() > 80) {
            throw new RuntimeException("Choose a display name between 2 and 80 characters.");
        }
        if (guestKey == null || guestKey.trim().length() < 4 || guestKey.length() > 64) {
            throw new RuntimeException("Guest key must be 4 to 64 characters so you can comment as the same person later.");
        }
        comment.setGuestName(name);
        comment.setGuestKeyHash(GuestIdentity.hash(name, guestKey.trim(), guestPepper));
        comment.setUser(null);
    }

    private void assertCanManage(Comment comment, String currentUsername, String guestKey) {
        if (currentUsername != null) {
            User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
            if (currentUser != null && "ADMIN".equals(currentUser.getRole())) {
                return;
            }
            if (comment.getUser() != null && currentUser != null
                    && comment.getUser().getId().equals(currentUser.getId())) {
                return;
            }
        }
        if (comment.getGuestKeyHash() != null && guestKey != null && comment.getGuestName() != null) {
            String hash = GuestIdentity.hash(comment.getGuestName(), guestKey.trim(), guestPepper);
            if (hash.equals(comment.getGuestKeyHash())) {
                return;
            }
        }
        throw new RuntimeException("You don't have permission to change this comment.");
    }
}



