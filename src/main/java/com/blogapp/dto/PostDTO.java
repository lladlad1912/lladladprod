package com.blogapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private String youtubeUrl;
    private String youtubeVideoId;
    private String youtubeEmbedUrl;
    private String imagePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long authorId;
    private String authorUsername;
    private Long categoryId;
    private String categoryName;
    private Long commentCount = 0L;
    private Long likeCount = 0L;
    private Boolean liked = false;
    private Long viewCount = 0L;
}

