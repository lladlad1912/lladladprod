package com.blogapp.repository;

import com.blogapp.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByCategoryId(Long categoryId);
    Page<Post> findByCategoryId(Long categoryId, Pageable pageable);
    List<Post> findByAuthorId(Long authorId);
    Page<Post> findByAuthorId(Long authorId, Pageable pageable);
    List<Post> findByCategoryIdAndAuthorId(Long categoryId, Long authorId);
    
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    List<Post> findAllOrderByCreatedAtDesc();
    
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    Page<Post> findAllOrderByCreatedAtDesc(Pageable pageable);
    
    // Search functionality
    @Query("SELECT p FROM Post p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY p.createdAt DESC")
    Page<Post> searchPosts(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE " +
           "p.category.id = :categoryId AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY p.createdAt DESC")
    Page<Post> searchPostsByCategory(@Param("categoryId") Long categoryId, @Param("keyword") String keyword, Pageable pageable);
    
    // Filter by status - treat NULL as PUBLISHED for backward compatibility
    @Query("SELECT p FROM Post p WHERE (p.status = :status OR (p.status IS NULL AND :status = 'PUBLISHED')) ORDER BY p.createdAt DESC")
    List<Post> findAllByStatusOrderByCreatedAtDesc(@Param("status") String status);
    
    @Query("SELECT p FROM Post p WHERE (p.status = :status OR (p.status IS NULL AND :status = 'PUBLISHED')) ORDER BY p.createdAt DESC")
    Page<Post> findAllByStatusOrderByCreatedAtDesc(@Param("status") String status, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.category.id = :categoryId AND (p.status = :status OR (p.status IS NULL AND :status = 'PUBLISHED')) ORDER BY p.createdAt DESC")
    List<Post> findByStatusAndCategoryId(@Param("status") String status, @Param("categoryId") Long categoryId);
    
    @Query("SELECT p FROM Post p WHERE p.category.id = :categoryId AND (p.status = :status OR (p.status IS NULL AND :status = 'PUBLISHED')) ORDER BY p.createdAt DESC")
    Page<Post> findByStatusAndCategoryId(@Param("status") String status, @Param("categoryId") Long categoryId, Pageable pageable);
    
    // Simple status queries (for admin/editor use)
    List<Post> findByStatus(String status);
    Page<Post> findByStatus(String status, Pageable pageable);
    List<Post> findByStatusAndAuthorId(String status, Long authorId);
    Page<Post> findByStatusAndAuthorId(String status, Long authorId, Pageable pageable);
}

