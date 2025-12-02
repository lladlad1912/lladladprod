package com.blogapp.service;

import com.blogapp.model.Post;
import com.blogapp.model.PostLike;
import com.blogapp.model.User;
import com.blogapp.repository.PostLikeRepository;
import com.blogapp.repository.PostRepository;
import com.blogapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PostLikeService {
    
    @Autowired
    private PostLikeRepository postLikeRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public boolean toggleLike(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        if (postLikeRepository.existsByPostIdAndUserId(postId, userId)) {
            // Unlike
            postLikeRepository.findByPostIdAndUserId(postId, userId)
                    .ifPresent(postLikeRepository::delete);
            return false;
        } else {
            // Like
            PostLike like = new PostLike();
            like.setPost(post);
            like.setUser(user);
            postLikeRepository.save(like);
            return true;
        }
    }
    
    public boolean isLiked(Long postId, Long userId) {
        return postLikeRepository.existsByPostIdAndUserId(postId, userId);
    }
    
    public long getLikeCount(Long postId) {
        return postLikeRepository.countByPostId(postId);
    }
    
    public List<Long> getLikedPostIds(Long userId) {
        return postLikeRepository.findByUserId(userId).stream()
                .map(like -> like.getPost().getId())
                .collect(java.util.stream.Collectors.toList());
    }
}

