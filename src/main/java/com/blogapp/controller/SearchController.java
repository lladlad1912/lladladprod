package com.blogapp.controller;

import com.blogapp.dto.PostDTO;
import com.blogapp.dto.UserDTO;
import com.blogapp.model.Category;
import com.blogapp.model.Post;
import com.blogapp.model.User;
import com.blogapp.repository.CategoryRepository;
import com.blogapp.repository.PostRepository;
import com.blogapp.repository.UserRepository;
import com.blogapp.service.PostService;
import com.blogapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "http://localhost:3000")
public class SearchController {
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private PostService postService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<?> searchAll(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "all") String type,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        try {
            String searchKeyword = keyword.trim().toLowerCase();
            if (searchKeyword.isEmpty()) {
                return ResponseEntity.badRequest().body("Keyword cannot be empty");
            }
            
            Map<String, Object> results = new HashMap<>();
            
            // Get user role for filtering posts
            String userRole = null;
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.isAuthenticated()) {
                    User user = userRepository.findByUsername(authentication.getName()).orElse(null);
                    if (user != null) {
                        userRole = user.getRole();
                    }
                }
            } catch (Exception e) {
                // Not authenticated, continue with public search
            }
            
            // Search posts
            if (type.equals("all") || type.equals("posts")) {
                List<Post> postResults;
                if (userRole != null && (userRole.equals("ADMIN") || userRole.equals("EDITOR"))) {
                    // Admin/Editor see all posts
                    postResults = postRepository.findAll().stream()
                            .filter(post -> 
                                (post.getTitle() != null && post.getTitle().toLowerCase().contains(searchKeyword)) ||
                                (post.getContent() != null && post.getContent().toLowerCase().contains(searchKeyword)) ||
                                (post.getHashtags() != null && post.getHashtags().toLowerCase().contains(searchKeyword))
                            )
                            .collect(Collectors.toList());
                } else {
                    // Regular users see only published posts
                    postResults = postRepository.findAll().stream()
                            .filter(post -> 
                                (post.getStatus() == null || post.getStatus().equals("PUBLISHED")) &&
                                ((post.getTitle() != null && post.getTitle().toLowerCase().contains(searchKeyword)) ||
                                 (post.getContent() != null && post.getContent().toLowerCase().contains(searchKeyword)) ||
                                 (post.getHashtags() != null && post.getHashtags().toLowerCase().contains(searchKeyword)))
                            )
                            .collect(Collectors.toList());
                }
                
                List<PostDTO> postDTOs = postResults.stream()
                        .map(post -> {
                            try {
                                return postService.getPostById(post.getId());
                            } catch (Exception e) {
                                return null;
                            }
                        })
                        .filter(dto -> dto != null)
                        .limit(size)
                        .collect(Collectors.toList());
                
                results.put("posts", postDTOs);
                results.put("postsCount", postDTOs.size());
            }
            
            // Search users
            if (type.equals("all") || type.equals("users")) {
                List<User> userResults = userRepository.findAll().stream()
                        .filter(user -> 
                            (user.getUsername() != null && user.getUsername().toLowerCase().contains(searchKeyword)) ||
                            (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchKeyword)) ||
                            (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(searchKeyword)) ||
                            (user.getLastName() != null && user.getLastName().toLowerCase().contains(searchKeyword))
                        )
                        .limit(size)
                        .collect(Collectors.toList());
                
                List<UserDTO> userDTOs = userResults.stream()
                        .map(user -> {
                            try {
                                return userService.getUserById(user.getId());
                            } catch (Exception e) {
                                return null;
                            }
                        })
                        .filter(dto -> dto != null)
                        .collect(Collectors.toList());
                
                results.put("users", userDTOs);
                results.put("usersCount", userDTOs.size());
            }
            
            // Search categories
            if (type.equals("all") || type.equals("categories")) {
                List<Category> categoryResults = categoryRepository.findAll().stream()
                        .filter(category -> 
                            (category.getName() != null && category.getName().toLowerCase().contains(searchKeyword)) ||
                            (category.getDescription() != null && category.getDescription().toLowerCase().contains(searchKeyword))
                        )
                        .limit(size)
                        .collect(Collectors.toList());
                
                List<Map<String, Object>> categoryDTOs = categoryResults.stream()
                        .map(cat -> {
                            Map<String, Object> catMap = new HashMap<>();
                            catMap.put("id", cat.getId());
                            catMap.put("name", cat.getName());
                            catMap.put("description", cat.getDescription());
                            return catMap;
                        })
                        .collect(Collectors.toList());
                
                results.put("categories", categoryDTOs);
                results.put("categoriesCount", categoryDTOs.size());
            }
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

