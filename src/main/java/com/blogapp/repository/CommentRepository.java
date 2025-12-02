package com.blogapp.repository;

import com.blogapp.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostId(Long postId);
    List<Comment> findByPostIdAndParentIsNull(Long postId);  // Top-level comments only
    Page<Comment> findByPostIdOrderByCreatedAtDesc(Long postId, Pageable pageable);
    Page<Comment> findByPostIdAndParentIsNullOrderByCreatedAtDesc(Long postId, Pageable pageable);
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);  // Replies to a comment
    List<Comment> findByUserId(Long userId);
    long countByPostId(Long postId);
}



