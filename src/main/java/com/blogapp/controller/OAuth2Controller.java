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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/oauth2")
@CrossOrigin(origins = "http://localhost:3000")
public class OAuth2Controller {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @PostMapping("/google/callback")
    public ResponseEntity<?> handleGoogleCallback(@RequestBody Map<String, Object> googleUser) {
        try {
            String email = (String) googleUser.get("email");
            String name = (String) googleUser.get("name");
            String picture = (String) googleUser.get("picture");
            String googleId = (String) googleUser.get("sub");
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required from Google");
            }
            
            // Check if user exists by email
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                // Create new user from Google account
                user = new User();
                user.setEmail(email);
                user.setUsername(email.split("@")[0] + "_" + System.currentTimeMillis()); // Generate unique username
                user.setPassword(passwordEncoder.encode("GOOGLE_OAUTH_" + googleId)); // Random password
                user.setFirstName(name != null ? name.split(" ")[0] : null);
                user.setLastName(name != null && name.split(" ").length > 1 ? name.split(" ")[1] : null);
                user.setProfileImage(picture);
                user.setRole("USER");
                user.setEnabled(true);
                user = userRepository.save(user);
            } else {
                // Update profile image if available
                if (picture != null && !picture.isEmpty()) {
                    user.setProfileImage(picture);
                    userRepository.save(user);
                }
            }
            
            // Create authentication
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user.getUsername(),
                    null,
                    user.getRole().equals("ADMIN") 
                        ? java.util.List.of(
                            new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"),
                            new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN")
                          )
                        : java.util.List.of(
                            new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER")
                          )
            );
            
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

