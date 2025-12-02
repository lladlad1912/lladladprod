package com.blogapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long postId;
    private Long userId;
    private String username;
    private String userProfileImage;
    private Long parentId;  // For nested comments
    private List<CommentDTO> replies = new ArrayList<>();  // Child comments
}



