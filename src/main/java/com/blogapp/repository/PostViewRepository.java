package com.blogapp.repository;

import com.blogapp.model.PostView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostViewRepository extends JpaRepository<PostView, Long> {
    
    List<PostView> findByPostId(Long postId);
    
    long countByPostId(Long postId);
    
    @Query("SELECT COUNT(DISTINCT pv.ipAddress) FROM PostView pv WHERE pv.post.id = :postId")
    long countUniqueVisitorsByPostId(@Param("postId") Long postId);
    
    @Query("SELECT pv.country, COUNT(pv) FROM PostView pv WHERE pv.post.id = :postId AND pv.country IS NOT NULL GROUP BY pv.country ORDER BY COUNT(pv) DESC")
    List<Object[]> getViewsByCountry(@Param("postId") Long postId);
    
    @Query("SELECT pv.city, COUNT(pv) FROM PostView pv WHERE pv.post.id = :postId AND pv.city IS NOT NULL GROUP BY pv.city ORDER BY COUNT(pv) DESC")
    List<Object[]> getViewsByCity(@Param("postId") Long postId);
    
    @Query("SELECT pv FROM PostView pv WHERE pv.post.id = :postId ORDER BY pv.viewedAt DESC")
    List<PostView> getRecentViewsByPostId(@Param("postId") Long postId);
    
    @Query("SELECT COUNT(pv) FROM PostView pv WHERE pv.post.id = :postId AND pv.viewedAt >= :startDate")
    long countViewsSince(@Param("postId") Long postId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT DATE(pv.viewedAt), COUNT(pv) FROM PostView pv WHERE pv.post.id = :postId GROUP BY DATE(pv.viewedAt) ORDER BY DATE(pv.viewedAt) DESC")
    List<Object[]> getViewsByDate(@Param("postId") Long postId);
}





















