# Complete Explanation of JWT-Related Classes

## Overview
JWT (JSON Web Token) authentication is implemented using **5 main classes** that work together to provide secure, stateless authentication. This document explains each class in detail.

---

## 🎯 JWT Classes Overview

```
┌─────────────────────────────────────────────────────────┐
│                    JWT Authentication Flow               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. AuthController                                       │
│     ↓ (login/register)                                   │
│  2. AuthenticationManager                                │
│     ↓ (validates credentials)                            │
│  3. CustomUserDetailsService                             │
│     ↓ (loads user from DB)                              │
│  4. JwtTokenProvider                                     │
│     ↓ (generates JWT token)                              │
│  5. JwtAuthenticationFilter                               │
│     ↓ (validates token on every request)                │
│  6. SecurityConfig                                       │
│     ↓ (configures everything)                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Class 1: `JwtTokenProvider.java`

### **Purpose**: 
The core JWT utility class that creates, validates, and extracts data from JWT tokens.

### **Location**: `com.blogapp.security.JwtTokenProvider`

### **Key Responsibilities**:
1. Generate JWT tokens
2. Extract username from tokens
3. Validate token authenticity and expiration

### **Code Breakdown**:

```java
@Component
public class JwtTokenProvider {
    
    // Reads secret key from application.properties
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    // Reads expiration time (24 hours = 86400000 ms)
    @Value("${jwt.expiration}")
    private long jwtExpirationMs;
    
    // Creates signing key from secret (for HMAC-SHA algorithm)
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
```

### **Methods Explained**:

#### 1. `generateToken(Authentication authentication)`
**What it does**: Creates a JWT token after successful login

**Step-by-step**:
```java
public String generateToken(Authentication authentication) {
    // 1. Get username from authenticated user
    UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
    
    // 2. Set current time and expiration time
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
    
    // 3. Build JWT token with:
    return Jwts.builder()
            .subject(userPrincipal.getUsername())  // Who the token is for
            .issuedAt(now)                         // When issued
            .expiration(expiryDate)                // When it expires
            .signWith(getSigningKey())             // Sign with secret key
            .compact();                            // Convert to string
}
```

**Example Output**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huX2RvZSIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoxNjk4ODUxODMyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Token Structure** (3 parts separated by dots):
- **Header**: Algorithm and token type
- **Payload**: Username, issued at, expiration
- **Signature**: HMAC signature (prevents tampering)

---

#### 2. `getUsernameFromToken(String token)`
**What it does**: Extracts the username from a JWT token

**Step-by-step**:
```java
public String getUsernameFromToken(String token) {
    // 1. Parse the token
    Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())    // Verify signature
            .build()
            .parseSignedClaims(token)       // Parse and get claims
            .getPayload();                  // Get payload (data)
    
    // 2. Extract username (stored as "subject")
    return claims.getSubject();
}
```

**Why**: We need to know which user the token belongs to without querying the database.

---

#### 3. `validateToken(String token)`
**What it does**: Checks if a token is valid and not expired

**Step-by-step**:
```java
public boolean validateToken(String token) {
    try {
        // Try to parse the token
        Jwts.parser()
                .verifyWith(getSigningKey())  // Verify signature matches
                .build()
                .parseSignedClaims(token);    // Parse token
        
        // If no exception, token is valid
        return true;
    } catch (JwtException | IllegalArgumentException e) {
        // Token is invalid, expired, or tampered with
        return false;
    }
}
```

**What it checks**:
- ✅ Signature is valid (not tampered)
- ✅ Token hasn't expired
- ✅ Token format is correct

---

## 📁 Class 2: `JwtAuthenticationFilter.java`

### **Purpose**: 
Intercepts every HTTP request to check for and validate JWT tokens.

### **Location**: `com.blogapp.security.JwtAuthenticationFilter`

### **Key Responsibilities**:
1. Extract JWT token from request header
2. Validate the token
3. Load user details if token is valid
4. Set authentication in Spring Security context

### **How It Works**:

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // This filter runs ONCE per request, before any controller
    
    @Autowired
    private JwtTokenProvider tokenProvider;        // To validate tokens
    
    @Autowired
    private UserDetailsService userDetailsService; // To load user details
```

### **Main Method: `doFilterInternal()`**

**Flow Diagram**:
```
Request arrives
    ↓
Extract token from "Authorization: Bearer <token>" header
    ↓
Is token present? → NO → Continue without authentication
    ↓ YES
Is token valid? → NO → Continue without authentication
    ↓ YES
Extract username from token
    ↓
Load user details from database
    ↓
Create Authentication object
    ↓
Set in SecurityContext (makes user "logged in")
    ↓
Continue to controller
```

**Code Explanation**:
```java
@Override
protected void doFilterInternal(HttpServletRequest request, 
                                HttpServletResponse response, 
                                FilterChain filterChain) {
    try {
        // Step 1: Extract token from header
        String jwt = getJwtFromRequest(request);
        
        // Step 2: If token exists and is valid
        if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
            
            // Step 3: Get username from token
            String username = tokenProvider.getUsernameFromToken(jwt);
            
            // Step 4: Load user from database
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            // Step 5: Create authentication object
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    userDetails,                    // Principal (user)
                    null,                          // Credentials (not needed)
                    userDetails.getAuthorities()    // Roles/permissions
                );
            
            // Step 6: Add request details
            authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
            );
            
            // Step 7: Set in SecurityContext (user is now "authenticated")
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
    } catch (Exception ex) {
        logger.error("Could not set user authentication", ex);
    }
    
    // Step 8: Continue to next filter/controller
    filterChain.doFilter(request, response);
}
```

### **Helper Method: `getJwtFromRequest()`**

```java
private String getJwtFromRequest(HttpServletRequest request) {
    // Get "Authorization" header
    String bearerToken = request.getHeader("Authorization");
    
    // Check if it starts with "Bearer " (JWT standard)
    if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
        // Extract token (remove "Bearer " prefix)
        return bearerToken.substring(7);
    }
    return null;
}
```

**Example Request Header**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📁 Class 3: `CustomUserDetailsService.java`

### **Purpose**: 
Tells Spring Security how to load users from the database.

### **Location**: `com.blogapp.security.CustomUserDetailsService`

### **Key Responsibilities**:
1. Load user from database by username
2. Convert our `User` entity to Spring Security's `UserDetails`
3. Assign roles/permissions to users

### **Why It's Needed**:
Spring Security doesn't know about our `User` entity. It needs a `UserDetails` object. This class bridges that gap.

### **Code Explanation**:

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) {
        // Step 1: Find user in database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        // Step 2: Convert to Spring Security UserDetails
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())      // Username
                .password(user.getPassword())      // Encrypted password
                .authorities(getAuthorities(user)) // Roles (USER, ADMIN)
                .build();
    }
```

### **Role Assignment**:

```java
private Collection<? extends GrantedAuthority> getAuthorities(User user) {
    Collection<GrantedAuthority> authorities = new ArrayList<>();
    
    // Everyone gets USER role
    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
    
    // Admins get additional ADMIN role
    if (user.getRole() != null && user.getRole().equals("ADMIN")) {
        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }
    
    return authorities;
}
```

**Why**: Spring Security uses roles to control access. `ROLE_USER` and `ROLE_ADMIN` can be used to restrict endpoints.

---

## 📁 Class 4: `SecurityConfig.java`

### **Purpose**: 
The main configuration class that sets up all security settings.

### **Location**: `com.blogapp.security.SecurityConfig`

### **Key Responsibilities**:
1. Configure password encoder (BCrypt)
2. Set up authentication provider
3. Configure which endpoints are public vs protected
4. Add JWT filter to security chain
5. Configure CORS for React frontend

### **Code Breakdown**:

#### 1. **Password Encoder Bean**
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```
**Why**: BCrypt is a one-way hashing algorithm. Passwords are never stored in plain text.

---

#### 2. **Authentication Provider**
```java
@Bean
public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userDetailsService);  // How to load users
    authProvider.setPasswordEncoder(passwordEncoder());      // How to check passwords
    return authProvider;
}
```
**Why**: Tells Spring Security how to authenticate users (check username/password).

---

#### 3. **Authentication Manager**
```java
@Bean
public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) {
    return authConfig.getAuthenticationManager();
}
```
**Why**: Used by `AuthController` to authenticate login requests.

---

#### 4. **Security Filter Chain** (Most Important)
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) {
    http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())  // Disable CSRF (not needed for JWT)
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        // ↑ No server-side sessions (JWT is stateless)
        
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()        // Public
            .requestMatchers("/api/posts/**").permitAll()      // Public
            .requestMatchers("/api/categories/**").permitAll()  // Public
            .requestMatchers("/uploads/**").permitAll()         // Public
            .anyRequest().authenticated()                       // Everything else needs auth
        )
        
        .authenticationProvider(authenticationProvider())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        // ↑ Add our JWT filter BEFORE Spring's default auth filter
    
    return http.build();
}
```

**Key Points**:
- **STATELESS**: No sessions stored on server
- **Public Endpoints**: `/api/auth/**`, `/api/posts/**`, etc. don't need authentication
- **Protected Endpoints**: Everything else requires valid JWT token
- **Filter Order**: JWT filter runs first to check tokens

---

#### 5. **CORS Configuration**
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("http://localhost:3000"));  // React app
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);  // Allow cookies/auth headers
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```
**Why**: Allows React frontend (running on port 3000) to make API calls.

---

## 📁 Class 5: `AuthController.java`

### **Purpose**: 
Handles login and registration endpoints.

### **Location**: `com.blogapp.controller.AuthController`

### **Key Responsibilities**:
1. Authenticate users (login)
2. Register new users
3. Generate and return JWT tokens

### **Login Endpoint**:

```java
@PostMapping("/login")
public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest loginRequest) {
    try {
        // Step 1: Authenticate user (checks username/password)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );
        
        // Step 2: Set authentication in context
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Step 3: Generate JWT token
        String jwt = tokenProvider.generateToken(authentication);
        
        // Step 4: Get user details
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Step 5: Return token and user info
        AuthResponse response = new AuthResponse();
        response.setToken(jwt);
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Invalid username or password");
    }
}
```

**Request Example**:
```json
POST /api/auth/login
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response Example**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com"
}
```

---

### **Register Endpoint**:

```java
@PostMapping("/register")
public ResponseEntity<?> registerUser(@RequestBody User user) {
    // Step 1: Check if username exists
    if (userRepository.existsByUsername(user.getUsername())) {
        return ResponseEntity.badRequest().body("Username is already taken!");
    }
    
    // Step 2: Check if email exists
    if (userRepository.existsByEmail(user.getEmail())) {
        return ResponseEntity.badRequest().body("Email is already in use!");
    }
    
    // Step 3: Encrypt password
    user.setPassword(passwordEncoder.encode(user.getPassword()));
    
    // Step 4: Set default role
    user.setRole("USER");
    user.setEnabled(true);
    
    // Step 5: Save user
    User savedUser = userRepository.save(user);
    
    // Step 6: Return user info (no token - user must login)
    AuthResponse response = new AuthResponse();
    response.setId(savedUser.getId());
    response.setUsername(savedUser.getUsername());
    response.setEmail(savedUser.getEmail());
    
    return ResponseEntity.ok(response);
}
```

**Note**: Registration doesn't return a token. User must login after registration.

---

## 🔄 Complete Authentication Flow

### **Registration Flow**:
```
1. User → POST /api/auth/register
2. AuthController → Validates username/email
3. AuthController → Encrypts password
4. AuthController → Saves user to database
5. AuthController → Returns user info
```

### **Login Flow**:
```
1. User → POST /api/auth/login (username + password)
2. AuthController → Calls AuthenticationManager
3. AuthenticationManager → Uses CustomUserDetailsService
4. CustomUserDetailsService → Loads user from database
5. AuthenticationManager → Compares passwords (BCrypt)
6. If valid → AuthController → Calls JwtTokenProvider
7. JwtTokenProvider → Generates JWT token
8. AuthController → Returns token to user
```

### **Protected Request Flow**:
```
1. User → GET /api/users (with Authorization: Bearer <token>)
2. JwtAuthenticationFilter → Intercepts request
3. JwtAuthenticationFilter → Extracts token from header
4. JwtAuthenticationFilter → Calls JwtTokenProvider.validateToken()
5. JwtTokenProvider → Validates token signature and expiration
6. If valid → JwtAuthenticationFilter → Extracts username
7. JwtAuthenticationFilter → Calls CustomUserDetailsService
8. CustomUserDetailsService → Loads user from database
9. JwtAuthenticationFilter → Sets authentication in SecurityContext
10. Request → Proceeds to Controller
11. Controller → Can access authenticated user
```

---

## 🔐 Security Features

### **1. Token Expiration**
- Tokens expire after 24 hours (configurable)
- Expired tokens are automatically rejected

### **2. Signature Verification**
- Every token is signed with a secret key
- Tampered tokens are rejected
- Secret key is stored in `application.properties`

### **3. Stateless Authentication**
- No server-side sessions
- Server doesn't store authentication state
- Token contains all necessary information

### **4. Password Encryption**
- Passwords are hashed with BCrypt
- Never stored in plain text
- One-way encryption (can't be reversed)

---

## 📝 DTOs Used

### **AuthRequest.java**
```java
public class AuthRequest {
    private String username;
    private String password;
}
```

### **AuthResponse.java**
```java
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
}
```

---

## 🧪 Testing JWT Authentication

### **1. Register a User**:
```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### **2. Login**:
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 1,
  "username": "testuser",
  "email": "test@example.com"
}
```

### **3. Use Token in Protected Request**:
```bash
GET http://localhost:8080/api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 Key Takeaways

1. **JwtTokenProvider**: Creates and validates tokens
2. **JwtAuthenticationFilter**: Checks tokens on every request
3. **CustomUserDetailsService**: Loads users for Spring Security
4. **SecurityConfig**: Configures all security settings
5. **AuthController**: Handles login/register endpoints

All 5 classes work together to provide secure, stateless authentication using JWT tokens!



























