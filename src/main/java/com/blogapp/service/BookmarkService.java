package com.blogapp.service;

import com.blogapp.dto.BookmarkDTO;
import com.blogapp.model.Bookmark;
import com.blogapp.model.Post;
import com.blogapp.model.User;
import com.blogapp.repository.BookmarkRepository;
import com.blogapp.repository.PostRepository;
import com.blogapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookmarkService {
    
    @Autowired
    private BookmarkRepository bookmarkRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public Bookmark toggleBookmark(Long userId, Long postId) {
        Optional<Bookmark> existingBookmark = bookmarkRepository.findByUserIdAndPostId(userId, postId);
        
        if (existingBookmark.isPresent()) {
            // Remove bookmark
            bookmarkRepository.delete(existingBookmark.get());
            return null;
        } else {
            // Add bookmark
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            
            Bookmark bookmark = new Bookmark();
            bookmark.setUser(user);
            bookmark.setPost(post);
            
            return bookmarkRepository.save(bookmark);
        }
    }
    
    public boolean isBookmarked(Long userId, Long postId) {
        return bookmarkRepository.existsByUserIdAndPostId(userId, postId);
    }
    
    public List<Bookmark> getUserBookmarks(Long userId) {
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<BookmarkDTO> getUserBookmarksDTO(Long userId) {
        List<Bookmark> bookmarks = getUserBookmarks(userId);
        return bookmarks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private BookmarkDTO convertToDTO(Bookmark bookmark) {
        Post post = bookmark.getPost();
        BookmarkDTO dto = new BookmarkDTO();
        dto.setId(bookmark.getId());
        dto.setPostId(post.getId());
        dto.setPostTitle(post.getTitle());
        dto.setPostImagePath(post.getImagePath());
        dto.setPostCategoryName(post.getCategory() != null ? post.getCategory().getName() : null);
        dto.setCreatedAt(bookmark.getCreatedAt());
        return dto;
    }
    
    public long getBookmarkCount(Long postId) {
        return bookmarkRepository.countByPostId(postId);
    }
}
