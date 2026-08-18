package com.blogapp.controller;

import com.blogapp.dto.PostDTO;
import com.blogapp.model.Category;
import com.blogapp.model.Post;
import com.blogapp.model.User;
import com.blogapp.repository.CategoryRepository;
import com.blogapp.repository.PostRepository;
import com.blogapp.repository.UserRepository;
import com.blogapp.service.PostService;
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
public class SearchController {
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private PostService postService;
    
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
            
            final String userRole = resolveCurrentUserRole();
            
            boolean searchPostsByContent = type.equals("all") || type.equals("posts");
            boolean searchPostsByAuthor = type.equals("all") || type.equals("author") || type.equals("users");

            if (searchPostsByContent || searchPostsByAuthor) {
                List<Post> postResults = postRepository.findAll().stream()
                        .filter(post -> isVisibleInSearch(post, userRole))
                        .filter(post -> {
                            boolean matchesContent = searchPostsByContent && matchesPostContent(post, searchKeyword);
                            boolean matchesAuthor = searchPostsByAuthor && matchesPostAuthor(post, searchKeyword);
                            if (type.equals("posts")) {
                                return matchesContent;
                            }
                            if (type.equals("author") || type.equals("users")) {
                                return matchesAuthor;
                            }
                            return matchesContent || matchesAuthor;
                        })
                        .collect(Collectors.toList());

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

    private String resolveCurrentUserRole() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                return userRepository.findByUsername(authentication.getName())
                        .map(User::getRole)
                        .orElse(null);
            }
        } catch (Exception e) {
            // Not authenticated, continue with public search
        }
        return null;
    }

    private boolean isVisibleInSearch(Post post, String userRole) {
        if (userRole != null && (userRole.equals("ADMIN") || userRole.equals("EDITOR"))) {
            return post.getStatus() == null || !"DRAFT".equals(post.getStatus());
        }
        return post.getStatus() == null || "PUBLISHED".equals(post.getStatus());
    }

    private boolean matchesPostContent(Post post, String searchKeyword) {
        return (post.getTitle() != null && post.getTitle().toLowerCase().contains(searchKeyword))
                || (post.getContent() != null && post.getContent().toLowerCase().contains(searchKeyword))
                || (post.getHashtags() != null && post.getHashtags().toLowerCase().contains(searchKeyword));
    }

    private boolean matchesPostAuthor(Post post, String searchKeyword) {
        User author = post.getAuthor();
        if (author == null) {
            return false;
        }

        String username = author.getUsername() != null ? author.getUsername().toLowerCase() : "";
        String firstName = author.getFirstName() != null ? author.getFirstName().toLowerCase() : "";
        String lastName = author.getLastName() != null ? author.getLastName().toLowerCase() : "";
        String fullName = (firstName + " " + lastName).trim();

        return username.contains(searchKeyword)
                || firstName.contains(searchKeyword)
                || lastName.contains(searchKeyword)
                || (!fullName.isEmpty() && fullName.contains(searchKeyword));
    }
}

