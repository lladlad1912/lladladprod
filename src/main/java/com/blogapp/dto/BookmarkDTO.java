package com.blogapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkDTO {
    private Long id;
    private Long postId;
    private String postTitle;
    private String postImagePath;
    private String postCategoryName;
    private LocalDateTime createdAt;
}



















