package com.blogapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostLikeDTO {
    private Long id;
    private Long postId;
    private Long userId;
    private String username;
    private LocalDateTime createdAt;
}




