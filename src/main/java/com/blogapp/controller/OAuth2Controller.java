package com.blogapp.controller;

import com.blogapp.dto.AuthResponse;
import com.blogapp.model.User;
import com.blogapp.repository.UserRepository;
import com.blogapp.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/oauth2")
@CrossOrigin(origins = "http://localhost:3000")
public class OAuth2Controller {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @PostMapping("/google/callback")
    public ResponseEntity<?> handleGoogleCallback(@RequestBody Map<String, Object> googleUser) {
        try {
            String email = (String) googleUser.get("email");
            String picture = (String) googleUser.get("picture");
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required from Google");
            }
            
            // Check if user exists by email
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                // First-time Google login - create new user
                String name = (String) googleUser.get("name");
                String firstName = name != null && name.contains(" ") ? name.substring(0, name.indexOf(" ")) : name;
                String lastName = name != null && name.contains(" ") ? name.substring(name.indexOf(" ") + 1) : null;
                
                // Generate username from email (before @)
                String usernameBase = email.substring(0, email.indexOf("@"));
                String username = usernameBase;
                int counter = 1;
                while (userRepository.existsByUsername(username)) {
                    username = usernameBase + counter;
                    counter++;
                }
                
                user = new User();
                user.setEmail(email);
                user.setUsername(username);
                user.setPassword(""); // OAuth users don't need password
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setProfileImage(picture);
                user.setRole("USER"); // Default role for new users
                user.setEnabled(true);
                
                user = userRepository.save(user);
                
                // Return response indicating profile needs to be completed
                AuthResponse response = new AuthResponse();
                response.setToken(tokenProvider.generateToken(createAuthentication(user)));
                response.setId(user.getId());
                response.setUsername(user.getUsername());
                response.setEmail(user.getEmail());
                
                Map<String, Object> responseMap = new java.util.HashMap<>();
                responseMap.put("token", response.getToken());
                responseMap.put("id", response.getId());
                responseMap.put("username", response.getUsername());
                responseMap.put("email", response.getEmail());
                responseMap.put("needsProfileSetup", true); // Flag for frontend
                
                return ResponseEntity.ok(responseMap);
            }
            
            // Update profile image if available
            if (picture != null && !picture.isEmpty()) {
                user.setProfileImage(picture);
                userRepository.save(user);
            }
            
            // Ensure user is enabled
            if (!user.getEnabled()) {
                return ResponseEntity.badRequest()
                    .body("Account is disabled. Please contact administrator.");
            }
            
            Authentication authentication = createAuthentication(user);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);
            
            AuthResponse response = new AuthResponse();
            response.setToken(jwt);
            response.setId(user.getId());
            response.setUsername(user.getUsername());
            response.setEmail(user.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing Google authentication: " + e.getMessage());
        }
    }
    
    private Authentication createAuthentication(User user) {
        // Create authentication with proper roles
        java.util.List<org.springframework.security.core.authority.SimpleGrantedAuthority> authorities = 
            new java.util.ArrayList<>();
        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"));
        
        if (user.getRole() != null) {
            if (user.getRole().equals("EDITOR")) {
                authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_EDITOR"));
            } else if (user.getRole().equals("ADMIN")) {
                authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_EDITOR"));
                authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"));
            }
        }
        
        return new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                null,
                authorities
        );
    }
    
    @GetMapping("/google/user-info")
    public ResponseEntity<?> getGoogleUserInfo(@RequestParam String email) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Map<String, Object> userInfo = new java.util.HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("firstName", user.getFirstName());
            userInfo.put("lastName", user.getLastName());
            userInfo.put("profileImage", user.getProfileImage());
            userInfo.put("role", user.getRole());
            
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("User not found");
        }
    }
}

