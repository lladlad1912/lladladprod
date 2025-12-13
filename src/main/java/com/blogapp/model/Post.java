package com.blogapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    // YouTube video URL - stores the full YouTube URL or video ID
    @Column(name = "youtube_url")
    private String youtubeUrl;
    
    // Image file path
    @Column(name = "image_path")
    private String imagePath;
    
    // Hashtags - comma-separated string
    @Column(name = "hashtags", length = 500)
    private String hashtags;
    
    // SEO Meta Title
    @Column(name = "meta_title", length = 200)
    private String metaTitle;
    
    // SEO Meta Description
    @Column(name = "meta_description", length = 500)
    private String metaDescription;
    
    // SEO Keywords
    @Column(name = "meta_keywords", length = 500)
    private String metaKeywords;
    
    // View count for the post
    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;
    
    // Post status: DRAFT, PENDING_REVIEW, PUBLISHED, REJECTED
    @Column(name = "status", nullable = false, length = 20)
    private String status = "PUBLISHED"; // Default for existing posts
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Optimistic locking version field
    @Version
    @Column(name = "version")
    private Long version;
    
    // Many posts belong to one user (author)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;
    
    // Many posts belong to one category
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    // Many posts can belong to one subcategory (optional)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sub_category_id")
    private SubCategory subCategory;
    
    // One post can have many comments
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
    
    // One post can have many likes
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostLike> likes = new ArrayList<>();
    
    // One post can have many bookmarks
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bookmark> bookmarks = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * Extracts YouTube video ID from various YouTube URL formats
     * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
     */
    public String getYouTubeVideoId() {
        if (youtubeUrl == null || youtubeUrl.isEmpty()) {
            return null;
        }
        
        // If it's already just an ID (11 characters, alphanumeric)
        if (youtubeUrl.matches("^[a-zA-Z0-9_-]{11}$")) {
            return youtubeUrl;
        }
        
        // Extract from various YouTube URL formats
        String videoId = null;
        if (youtubeUrl.contains("youtube.com/watch?v=")) {
            videoId = youtubeUrl.substring(youtubeUrl.indexOf("v=") + 2);
            if (videoId.contains("&")) {
                videoId = videoId.substring(0, videoId.indexOf("&"));
            }
        } else if (youtubeUrl.contains("youtu.be/")) {
            videoId = youtubeUrl.substring(youtubeUrl.indexOf("youtu.be/") + 9);
            if (videoId.contains("?")) {
                videoId = videoId.substring(0, videoId.indexOf("?"));
            }
        } else if (youtubeUrl.contains("youtube.com/embed/")) {
            videoId = youtubeUrl.substring(youtubeUrl.indexOf("embed/") + 6);
            if (videoId.contains("?")) {
                videoId = videoId.substring(0, videoId.indexOf("?"));
            }
        }
        
        return videoId;
    }
    
    /**
     * Returns the embed URL for YouTube video
     */
    public String getYouTubeEmbedUrl() {
        String videoId = getYouTubeVideoId();
        if (videoId == null) {
            return null;
        }
        return "https://www.youtube.com/embed/" + videoId;
    }
}

