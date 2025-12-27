package com.blogapp.repository;

import com.blogapp.model.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {
    
    Optional<UserFollow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
    
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    
    long countByFollowerId(Long followerId); // Count of users this user follows
    
    long countByFollowingId(Long followingId); // Count of users following this user
    
    List<UserFollow> findByFollowerId(Long followerId); // Users this user follows
    
    List<UserFollow> findByFollowingId(Long followingId); // Users following this user
}















