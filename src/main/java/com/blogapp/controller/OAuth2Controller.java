package com.blogapp.controller;

import com.blogapp.dto.AuthResponse;
import com.blogapp.model.User;
import com.blogapp.repository.UserRepository;
import com.blogapp.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/oauth2")
public class OAuth2Controller {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.oauth.google.client-id:}")
    private String googleClientId;

    @Value("${app.oauth.require-existing-user:false}")
    private boolean requireExistingUser;

    private final RestTemplate restTemplate = new RestTemplate();
    
    @PostMapping("/google/callback")
    public ResponseEntity<?> handleGoogleCallback(@RequestBody Map<String, Object> googleUser) {
        try {
            Map<String, Object> verified = verifyGoogleUser(googleUser);
            if (verified.containsKey("error")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(verified.get("error"));
            }

            String email = (String) verified.get("email");
            String picture = (String) verified.get("picture");
            String name = (String) verified.get("name");
            
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                if (requireExistingUser) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("No account exists for this Google email. Ask an admin to add you first.");
                }

                String firstName = name != null && name.contains(" ") ? name.substring(0, name.indexOf(" ")) : name;
                String lastName = name != null && name.contains(" ") ? name.substring(name.indexOf(" ") + 1) : null;
                
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
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setProfileImage(picture);
                user.setRole("USER");
                user.setEnabled(true);
                
                user = userRepository.save(user);
                
                AuthResponse response = toAuthResponse(user);
                Map<String, Object> responseMap = new java.util.HashMap<>();
                responseMap.put("token", response.getToken());
                responseMap.put("id", response.getId());
                responseMap.put("username", response.getUsername());
                responseMap.put("email", response.getEmail());
                responseMap.put("needsProfileSetup", true);
                
                return ResponseEntity.ok(responseMap);
            }
            
            if (picture != null && !picture.isEmpty()) {
                user.setProfileImage(picture);
                userRepository.save(user);
            }
            
            if (!user.getEnabled()) {
                return ResponseEntity.badRequest()
                    .body("Account is disabled. Please contact administrator.");
            }
            
            return ResponseEntity.ok(toAuthResponse(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing Google authentication: " + e.getMessage());
        }
    }

    private Map<String, Object> verifyGoogleUser(Map<String, Object> googleUser) {
        Object credential = googleUser.get("credential");
        if (credential instanceof String token && !token.isBlank()) {
            return verifyIdToken(token);
        }

        String email = (String) googleUser.get("email");
        if (email == null || email.isBlank()) {
            return Map.of("error", "Google credential or email is required");
        }
        if (googleClientId != null && !googleClientId.isBlank()) {
            return Map.of("error", "Send the Google ID token in credential so the server can verify it");
        }
        Map<String, Object> fallback = new java.util.HashMap<>();
        fallback.put("email", email);
        fallback.put("name", googleUser.get("name"));
        fallback.put("picture", googleUser.get("picture"));
        return fallback;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> verifyIdToken(String idToken) {
        try {
            String url = UriComponentsBuilder
                    .fromUriString("https://oauth2.googleapis.com/tokeninfo")
                    .queryParam("id_token", idToken)
                    .toUriString();
            Map<String, Object> tokenInfo = restTemplate.getForObject(url, Map.class);
            if (tokenInfo == null || tokenInfo.get("email") == null) {
                return Map.of("error", "Google token could not be verified");
            }
            if (googleClientId != null && !googleClientId.isBlank()) {
                Object audience = tokenInfo.get("aud");
                if (audience == null || !googleClientId.equals(audience.toString())) {
                    return Map.of("error", "Google token was issued for a different client");
                }
            }
            Object verified = tokenInfo.get("email_verified");
            if (verified != null && !"true".equalsIgnoreCase(String.valueOf(verified))) {
                return Map.of("error", "Google email is not verified");
            }
            return tokenInfo;
        } catch (RestClientException e) {
            return Map.of("error", "Google token verification failed");
        }
    }

    private AuthResponse toAuthResponse(User user) {
        Authentication authentication = createAuthentication(user);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        AuthResponse response = new AuthResponse();
        response.setToken(tokenProvider.generateToken(authentication));
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        return response;
    }
    
    private Authentication createAuthentication(User user) {
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
