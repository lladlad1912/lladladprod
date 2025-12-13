package com.blogapp.service;

import com.blogapp.dto.PageResponse;
import com.blogapp.dto.PostDTO;
import com.blogapp.model.Category;
import com.blogapp.model.Post;
import com.blogapp.model.User;
import com.blogapp.repository.CategoryRepository;
import com.blogapp.repository.PostRepository;
import com.blogapp.repository.SubCategoryRepository;
import com.blogapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(isolation = Isolation.READ_COMMITTED)
public class PostService {
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private SubCategoryRepository subCategoryRepository;
    
    @Autowired
    private CommentService commentService;
    
    @Autowired
    private PostLikeService postLikeService;
    
    public List<PostDTO> getAllPosts() {
        return postRepository.findAllOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PostDTO> getAllPosts(String userRole) {
        // For admin/editor, show all posts. For regular users, only show published posts
        if (userRole != null && (userRole.equals("ADMIN") || userRole.equals("EDITOR"))) {
            return postRepository.findAllOrderByCreatedAtDesc().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } else {
            return postRepository.findAllByStatusOrderByCreatedAtDesc("PUBLISHED").stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }
    }
    
    public PageResponse<PostDTO> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postPage = postRepository.findAllOrderByCreatedAtDesc(pageable);
        
        List<PostDTO> content = postPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return new PageResponse<>(
                content,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalElements(),
                postPage.getTotalPages(),
                postPage.isLast(),
                postPage.isFirst()
        );
    }
    
    public PageResponse<PostDTO> getAllPosts(int page, int size, String userRole) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postPage;
        
        // For admin/editor, show all posts. For regular users, only show published posts
        if (userRole != null && (userRole.equals("ADMIN") || userRole.equals("EDITOR"))) {
            postPage = postRepository.findAllOrderByCreatedAtDesc(pageable);
        } else {
            postPage = postRepository.findAllByStatusOrderByCreatedAtDesc("PUBLISHED", pageable);
        }
        
        List<PostDTO> content = postPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return new PageResponse<>(
                content,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalElements(),
                postPage.getTotalPages(),
                postPage.isLast(),
                postPage.isFirst()
        );
    }
    
    @Cacheable(value = "posts", key = "#id")
    public PostDTO getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        return convertToDTO(post);
    }
    
    public PostDTO getPostById(Long id, Long userId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        PostDTO dto = convertToDTO(post);
        if (userId != null) {
            dto.setLiked(postLikeService.isLiked(id, userId));
        }
        return dto;
    }
    
    public List<PostDTO> getPostsByCategory(Long categoryId) {
        return postRepository.findByCategoryId(categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PostDTO> getPostsByCategory(Long categoryId, String userRole) {
        // For admin/editor, show all posts. For regular users, only show published posts
        if (userRole != null && (userRole.equals("ADMIN") || userRole.equals("EDITOR"))) {
            return postRepository.findByCategoryId(categoryId).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } else {
            return postRepository.findByStatusAndCategoryId("PUBLISHED", categoryId).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }
    }
    
    public PageResponse<PostDTO> getPostsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postPage = postRepository.findByCategoryId(categoryId, pageable);
        
        List<PostDTO> content = postPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return new PageResponse<>(
                content,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalElements(),
                postPage.getTotalPages(),
                postPage.isLast(),
                postPage.isFirst()
        );
    }
    
    public PageResponse<PostDTO> getPostsByCategory(Long categoryId, int page, int size, String userRole) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postPage;
        
        // For admin/editor, show all posts. For regular users, only show published posts
        if (userRole != null && (userRole.equals("ADMIN") || userRole.equals("EDITOR"))) {
            postPage = postRepository.findByCategoryId(categoryId, pageable);
        } else {
            postPage = postRepository.findByStatusAndCategoryId("PUBLISHED", categoryId, pageable);
        }
        
        List<PostDTO> content = postPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return new PageResponse<>(
                content,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalElements(),
                postPage.getTotalPages(),
                postPage.isLast(),
                postPage.isFirst()
        );
    }
    
    public List<PostDTO> getPostsByUser(Long userId) {
        return postRepository.findByAuthorId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public PageResponse<PostDTO> getPostsByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postPage = postRepository.findByAuthorId(userId, pageable);
        
        List<PostDTO> content = postPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return new PageResponse<>(
                content,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalElements(),
                postPage.getTotalPages(),
                postPage.isLast(),
                postPage.isFirst()
        );
    }
    
    public PageResponse<PostDTO> searchPosts(String keyword, Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postPage;
        
        if (categoryId != null) {
            postPage = postRepository.searchPostsByCategory(categoryId, keyword, pageable);
        } else {
            postPage = postRepository.searchPosts(keyword, pageable);
        }
        
        List<PostDTO> content = postPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return new PageResponse<>(
                content,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalElements(),
                postPage.getTotalPages(),
                postPage.isLast(),
                postPage.isFirst()
        );
    }
    
    @CacheEvict(value = "posts", allEntries = true)
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PostDTO createPost(Post post, Long userId, Long categoryId, Long subCategoryId) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
        
        post.setAuthor(author);
        post.setCategory(category);
        
        // Set subcategory if provided
        if (subCategoryId != null) {
            com.blogapp.model.SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                    .orElseThrow(() -> new RuntimeException("SubCategory not found with id: " + subCategoryId));
            // Verify subcategory belongs to the selected category
            if (!subCategory.getCategory().getId().equals(categoryId)) {
                throw new RuntimeException("SubCategory does not belong to the selected category");
            }
            post.setSubCategory(subCategory);
        }
        
        // Set post status based on user role
        // ADMIN and EDITOR posts are published immediately
        // Regular USER posts need review
        if (post.getStatus() == null || post.getStatus().isEmpty()) {
            String userRole = author.getRole();
            if (userRole != null && (userRole.equals("ADMIN") || userRole.equals("EDITOR"))) {
                post.setStatus("PUBLISHED");
            } else {
                post.setStatus("PENDING_REVIEW");
            }
        }
        
        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost);
    }
    
    @CacheEvict(value = "posts", key = "#id")
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PostDTO updatePost(Long id, Post postDetails, String currentUsername, Map<String, Object> request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        
        // Check ownership: Only ADMIN or post author can update
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean isAdmin = currentUser.getRole() != null && currentUser.getRole().equals("ADMIN");
        boolean isOwner = post.getAuthor().getId().equals(currentUser.getId());
        
        if (!isAdmin && !isOwner) {
            throw new RuntimeException("You don't have permission to update this post. Only the post author or admin can update.");
        }
        
        if (postDetails.getTitle() != null) {
            post.setTitle(postDetails.getTitle());
        }
        
        if (postDetails.getContent() != null) {
            post.setContent(postDetails.getContent());
        }
        
        if (postDetails.getYoutubeUrl() != null) {
            post.setYoutubeUrl(postDetails.getYoutubeUrl());
        }
        
        if (postDetails.getImagePath() != null) {
            post.setImagePath(postDetails.getImagePath());
        }
        
        if (postDetails.getHashtags() != null) {
            post.setHashtags(postDetails.getHashtags());
        }
        
        if (postDetails.getMetaTitle() != null) {
            post.setMetaTitle(postDetails.getMetaTitle());
        }
        
        if (postDetails.getMetaDescription() != null) {
            post.setMetaDescription(postDetails.getMetaDescription());
        }
        
        if (postDetails.getMetaKeywords() != null) {
            post.setMetaKeywords(postDetails.getMetaKeywords());
        }
        
        if (postDetails.getCategory() != null) {
            Category category = categoryRepository.findById(postDetails.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            post.setCategory(category);
        }
        
        if (postDetails.getSubCategory() != null) {
            com.blogapp.model.SubCategory subCategory = subCategoryRepository.findById(postDetails.getSubCategory().getId())
                    .orElseThrow(() -> new RuntimeException("SubCategory not found"));
            // Verify subcategory belongs to the post's category
            if (!subCategory.getCategory().getId().equals(post.getCategory().getId())) {
                throw new RuntimeException("SubCategory does not belong to the post's category");
            }
            post.setSubCategory(subCategory);
        } else if (postDetails.getSubCategory() == null && request.containsKey("subCategoryId") && request.get("subCategoryId") == null) {
            // Explicitly clear subcategory if null is provided
            post.setSubCategory(null);
        }
        
        Post updatedPost = postRepository.save(post);
        return convertToDTO(updatedPost);
    }
    
    @CacheEvict(value = "posts", key = "#id")
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deletePost(Long id, String currentUsername) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        
        // Only ADMIN can delete posts
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean isAdmin = currentUser.getRole() != null && currentUser.getRole().equals("ADMIN");
        
        if (!isAdmin) {
            throw new RuntimeException("You don't have permission to delete this post. Only admin can delete posts.");
        }
        
        postRepository.deleteById(id);
    }
    
    private PostDTO convertToDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setYoutubeUrl(post.getYoutubeUrl());
        dto.setYoutubeVideoId(post.getYouTubeVideoId());
        dto.setYoutubeEmbedUrl(post.getYouTubeEmbedUrl());
        dto.setImagePath(post.getImagePath());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setAuthorId(post.getAuthor().getId());
        dto.setAuthorUsername(post.getAuthor().getUsername());
        dto.setCategoryId(post.getCategory().getId());
        dto.setCategoryName(post.getCategory().getName());
        if (post.getSubCategory() != null) {
            dto.setSubCategoryId(post.getSubCategory().getId());
            dto.setSubCategoryName(post.getSubCategory().getName());
        }
        dto.setCommentCount(commentService.getCommentCount(post.getId()));
        dto.setLikeCount(postLikeService.getLikeCount(post.getId()));
        dto.setViewCount(post.getViewCount());
        dto.setHashtags(post.getHashtags());
        dto.setMetaTitle(post.getMetaTitle());
        dto.setMetaDescription(post.getMetaDescription());
        dto.setMetaKeywords(post.getMetaKeywords());
        dto.setStatus(post.getStatus() != null ? post.getStatus() : "PUBLISHED");
        return dto;
    }
    
    public void incrementViewCount(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
    }
    
    public long getTotalSiteViews() {
        return postRepository.findAll().stream()
                .mapToLong(Post::getViewCount)
                .sum();
    }
    
    @CacheEvict(value = "posts", allEntries = true)
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PostDTO approvePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        post.setStatus("PUBLISHED");
        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost);
    }
    
    @CacheEvict(value = "posts", allEntries = true)
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PostDTO rejectPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        post.setStatus("REJECTED");
        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost);
    }
    
    public List<PostDTO> getPostsByStatus(String status) {
        return postRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}

