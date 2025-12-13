package com.blogapp.repository;

import com.blogapp.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Optional<Bookmark> findByUserIdAndPostId(Long userId, Long postId);
    
    List<Bookmark> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    boolean existsByUserIdAndPostId(Long userId, Long postId);
    
    void deleteByUserIdAndPostId(Long userId, Long postId);
    
    @Query("SELECT COUNT(b) FROM Bookmark b WHERE b.post.id = :postId")
    long countByPostId(@Param("postId") Long postId);
}








