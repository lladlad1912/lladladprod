package com.blogapp.service;

import com.blogapp.model.User;
import com.blogapp.model.UserFollow;
import com.blogapp.repository.UserFollowRepository;
import com.blogapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserFollowService {
    
    @Autowired
    private UserFollowRepository userFollowRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public boolean toggleFollow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new RuntimeException("Cannot follow yourself");
        }
        
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower user not found"));
        
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new RuntimeException("Following user not found"));
        
        Optional<UserFollow> existingFollow = userFollowRepository.findByFollowerIdAndFollowingId(followerId, followingId);
        
        if (existingFollow.isPresent()) {
            // Unfollow
            userFollowRepository.delete(existingFollow.get());
            return false;
        } else {
            // Follow
            UserFollow follow = new UserFollow();
            follow.setFollower(follower);
            follow.setFollowing(following);
            userFollowRepository.save(follow);
            return true;
        }
    }
    
    public boolean isFollowing(Long followerId, Long followingId) {
        return userFollowRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }
    
    public long getFollowingCount(Long userId) {
        return userFollowRepository.countByFollowerId(userId);
    }
    
    public long getFollowersCount(Long userId) {
        return userFollowRepository.countByFollowingId(userId);
    }
}

