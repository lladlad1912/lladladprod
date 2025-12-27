package com.blogapp.config;

import com.blogapp.model.Category;
import com.blogapp.model.Post;
import com.blogapp.model.SiteSettings;
import com.blogapp.model.User;
import com.blogapp.repository.CategoryRepository;
import com.blogapp.repository.PostRepository;
import com.blogapp.repository.SiteSettingsRepository;
import com.blogapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private SiteSettingsRepository settingsRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Initialize site settings
        initializeSiteSettings();
        
        // Initialize/Update categories to match navbar (Books, Movies, Tech, Dharma, Gaming)
        initializeOrUpdateCategories();
        
        // Only initialize users and posts if database is empty
        if (userRepository.count() == 0) {
            initializeUsersAndPosts();
        } else {
            // Update existing posts with random categories if categories exist
            updatePostsWithRandomCategories();
        }
        
        // Update existing posts with NULL status to PUBLISHED
        updatePostsStatus();
    }
    
    private void updatePostsStatus() {
        // Update all posts with NULL status to PUBLISHED for backward compatibility
        var allPosts = postRepository.findAll();
        boolean updated = false;
        for (Post post : allPosts) {
            if (post.getStatus() == null || post.getStatus().isEmpty()) {
                post.setStatus("PUBLISHED");
                postRepository.save(post);
                updated = true;
            }
        }
        if (updated) {
            System.out.println("Updated existing posts with NULL status to PUBLISHED");
        }
    }
    
    private void initializeSiteSettings() {
        // Initialize default social media URLs
        if (!settingsRepository.existsByKey("social_facebook")) {
            SiteSettings facebook = new SiteSettings();
            facebook.setKey("social_facebook");
            facebook.setValue("https://facebook.com/lladlad");
            facebook.setDescription("Facebook page URL");
            settingsRepository.save(facebook);
        }
        
        if (!settingsRepository.existsByKey("social_instagram")) {
            SiteSettings instagram = new SiteSettings();
            instagram.setKey("social_instagram");
            instagram.setValue("https://instagram.com/lladlad");
            instagram.setDescription("Instagram profile URL");
            settingsRepository.save(instagram);
        }
        
        if (!settingsRepository.existsByKey("social_twitter")) {
            SiteSettings twitter = new SiteSettings();
            twitter.setKey("social_twitter");
            twitter.setValue("https://twitter.com/lladlad");
            twitter.setDescription("Twitter profile URL");
            settingsRepository.save(twitter);
        }

        // Default order for Follow Us icons (used by footer drag-and-drop)
        if (!settingsRepository.existsByKey("social_order")) {
            SiteSettings order = new SiteSettings();
            order.setKey("social_order");
            order.setValue("facebook,instagram,twitter,email");
            order.setDescription("Order of social icons in footer (comma-separated keys)");
            settingsRepository.save(order);
        }
        
        // Initialize contact email
        if (!settingsRepository.existsByKey("contact_email")) {
            SiteSettings email = new SiteSettings();
            email.setKey("contact_email");
            email.setValue("contact@lladlad.com");
            email.setDescription("Contact email for submissions");
            settingsRepository.save(email);
        }
        
        // Initialize footer description
        if (!settingsRepository.existsByKey("footer_description")) {
            SiteSettings desc = new SiteSettings();
            desc.setKey("footer_description");
            desc.setValue("Your destination for insightful articles, engaging stories, and thought-provoking content.");
            desc.setDescription("Footer description text");
            settingsRepository.save(desc);
        }
    }
    
    private void initializeOrUpdateCategories() {
        // Define the required categories matching navbar
        String[][] categoryData = {
            {"Books", "Book reviews, literature, reading recommendations, and literary discussions"},
            {"Movies", "Movie reviews, discussions, and entertainment news"},
            {"Tech", "Technology, programming, software development, and tech news"},
            {"Dharma", "Spiritual teachings, philosophy, and wisdom"},
            {"Gaming", "Video games, reviews, gaming news, and esports"}
        };
        
        // Create or update required categories
        for (String[] data : categoryData) {
            String categoryName = data[0];
            String description = data[1];
            categoryRepository.findByName(categoryName).ifPresentOrElse(
                existing -> {
                    // Update description if needed
                    if (existing.getDescription() == null || existing.getDescription().isEmpty()) {
                        existing.setDescription(description);
                    }
                    // Ensure default header categories are checked initially, but do not override explicit admin choice.
                    if (existing.getShowInHeader() == null) {
                        existing.setShowInHeader(true);
                    }
                    categoryRepository.save(existing);
                },
                () -> {
                    // Create new category
                    Category newCategory = new Category();
                    newCategory.setName(categoryName);
                    newCategory.setDescription(description);
                    newCategory.setShowInHeader(true);
                    categoryRepository.save(newCategory);
                }
            );
        }
        
        // Remove old categories that don't match navbar (Technology, Travel, Food, etc.)
        var allCategories = categoryRepository.findAll();
        for (Category cat : allCategories) {
            boolean isRequired = false;
            for (String[] data : categoryData) {
                if (data[0].equals(cat.getName())) {
                    isRequired = true;
                    break;
                }
            }
            if (!isRequired) {
                // Don't delete categories with posts - just leave them for now
                // They won't show in the UI but won't break existing posts
                // Admin can manually delete them later if needed
            }
        }
    }
    
    private void updatePostsWithRandomCategories() {
        // Get all navbar categories
        Category booksCategory = categoryRepository.findByName("Books").orElse(null);
        Category moviesCategory = categoryRepository.findByName("Movies").orElse(null);
        Category techCategory = categoryRepository.findByName("Tech").orElse(null);
        Category dharmaCategory = categoryRepository.findByName("Dharma").orElse(null);
        Category gamingCategory = categoryRepository.findByName("Gaming").orElse(null);
        
        // Only update if all categories exist
        if (booksCategory != null && moviesCategory != null && techCategory != null && 
            dharmaCategory != null && gamingCategory != null) {
            Category[] categories = {booksCategory, moviesCategory, techCategory, dharmaCategory, gamingCategory};
            
            // Get all posts without categories or with old categories
            var allPosts = postRepository.findAll();
            for (Post post : allPosts) {
                // Only update if post has no category or has an old category
                if (post.getCategory() == null || 
                    (!post.getCategory().getName().equals("Books") &&
                     !post.getCategory().getName().equals("Movies") &&
                     !post.getCategory().getName().equals("Tech") &&
                     !post.getCategory().getName().equals("Dharma") &&
                     !post.getCategory().getName().equals("Gaming"))) {
                    post.setCategory(categories[(int)(Math.random() * categories.length)]);
                    postRepository.save(post);
                }
            }
        }
    }
    
    private void initializeUsersAndPosts() {
        // Create admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@lladlad.com");
        admin.setPassword(passwordEncoder.encode("Admin123!@"));
        admin.setRole("ADMIN");
        admin.setEnabled(true);
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin = userRepository.save(admin);
        
        // Create sample users
        User user1 = new User();
        user1.setUsername("john_doe");
        user1.setEmail("john@example.com");
        user1.setPassword(passwordEncoder.encode("Password123!@"));
        user1.setRole("USER");
        user1.setEnabled(true);
        user1 = userRepository.save(user1);
        
        User user2 = new User();
        user2.setUsername("jane_smith");
        user2.setEmail("jane@example.com");
        user2.setPassword(passwordEncoder.encode("Pass123!@"));
        user2.setRole("USER");
        user2.setEnabled(true);
        user2 = userRepository.save(user2);
        
        // Create sample EDITOR user
        User editor = new User();
        editor.setUsername("editor_user");
        editor.setEmail("editor@lladlad.com");
        editor.setPassword(passwordEncoder.encode("Editor123!@"));
        editor.setRole("EDITOR");
        editor.setEnabled(true);
        editor.setFirstName("Editor");
        editor.setLastName("User");
        editor = userRepository.save(editor);
        
        // Get categories (should already exist from initializeCategories, but create if needed)
        Category booksCategory = categoryRepository.findByName("Books")
            .orElseGet(() -> {
                Category cat = new Category();
                cat.setName("Books");
                cat.setDescription("Book reviews, literature, reading recommendations, and literary discussions");
                return categoryRepository.save(cat);
            });
        
        Category moviesCategory = categoryRepository.findByName("Movies")
            .orElseGet(() -> {
                Category cat = new Category();
                cat.setName("Movies");
                cat.setDescription("Movie reviews, discussions, and entertainment news");
                return categoryRepository.save(cat);
            });
        
        Category techCategory = categoryRepository.findByName("Tech")
            .orElseGet(() -> {
                Category cat = new Category();
                cat.setName("Tech");
                cat.setDescription("Technology, programming, software development, and tech news");
                return categoryRepository.save(cat);
            });
        
        Category dharmaCategory = categoryRepository.findByName("Dharma")
            .orElseGet(() -> {
                Category cat = new Category();
                cat.setName("Dharma");
                cat.setDescription("Spiritual teachings, philosophy, and wisdom");
                return categoryRepository.save(cat);
            });
        
        Category gamingCategory = categoryRepository.findByName("Gaming")
            .orElseGet(() -> {
                Category cat = new Category();
                cat.setName("Gaming");
                cat.setDescription("Video games, reviews, gaming news, and esports");
                return categoryRepository.save(cat);
            });
        
        // Store categories in array for random assignment
        Category[] categories = {booksCategory, moviesCategory, techCategory, dharmaCategory, gamingCategory};
        
        // Create sample posts with randomly assigned categories
        Post post1 = new Post();
        post1.setTitle("Getting Started with Spring Boot");
        post1.setContent("Spring Boot is a powerful framework that makes it easy to create stand-alone, production-grade Spring-based applications. In this post, we'll explore the basics of Spring Boot and how to get started with your first application.");
        post1.setYoutubeUrl("https://www.youtube.com/watch?v=vtPkZShrvXQ");
        post1.setAuthor(user1);
        post1.setCategory(categories[(int)(Math.random() * categories.length)]);
        postRepository.save(post1);
        
        Post post2 = new Post();
        post2.setTitle("Top 10 Movies of 2024");
        post2.setContent("Looking for your next movie night? Here are the top 10 movies you should watch in 2024. From action-packed blockbusters to thought-provoking dramas, there's something for everyone.");
        post2.setAuthor(user2);
        post2.setCategory(categories[(int)(Math.random() * categories.length)]);
        postRepository.save(post2);
        
        Post post3 = new Post();
        post3.setTitle("Understanding Dharma in Modern Life");
        post3.setContent("Dharma is a fundamental concept that guides our actions and decisions. In this post, we explore how ancient wisdom can be applied to modern challenges and help us live more meaningful lives.");
        post3.setYoutubeUrl("https://youtu.be/dQw4w9WgXcQ");
        post3.setAuthor(user1);
        post3.setCategory(categories[(int)(Math.random() * categories.length)]);
        postRepository.save(post3);
        
        Post post4 = new Post();
        post4.setTitle("Best Gaming Setup for 2024");
        post4.setContent("Building the perfect gaming setup doesn't have to break the bank. Here's a comprehensive guide to choosing the right components, from graphics cards to gaming chairs, for an optimal gaming experience.");
        post4.setAuthor(user2);
        post4.setCategory(categories[(int)(Math.random() * categories.length)]);
        postRepository.save(post4);
        
        Post post5 = new Post();
        post5.setTitle("Latest Tech Trends: AI and Machine Learning");
        post5.setContent("Artificial Intelligence and Machine Learning are revolutionizing industries. Discover the latest trends, applications, and how these technologies are shaping our future.");
        post5.setAuthor(admin);
        post5.setCategory(categories[(int)(Math.random() * categories.length)]);
        postRepository.save(post5);
        
        Post post6 = new Post();
        post6.setTitle("Cinematic Masterpieces: A Film Lover's Guide");
        post6.setContent("Explore the world of cinema through these timeless masterpieces. From classic films to modern gems, discover movies that have shaped the art of storytelling.");
        post6.setAuthor(user1);
        post6.setCategory(categories[(int)(Math.random() * categories.length)]);
        postRepository.save(post6);
        
        Post post7 = new Post();
        post7.setTitle("The Path of Dharma: Finding Balance");
        post7.setContent("In today's fast-paced world, finding balance is essential. Learn how the principles of dharma can help you navigate life's challenges with wisdom and compassion.");
        post7.setAuthor(user2);
        post7.setCategory(categories[(int)(Math.random() * categories.length)]);
        postRepository.save(post7);
        
        Post post8 = new Post();
        post8.setTitle("Gaming Review: The Latest RPG Adventure");
        post8.setContent("Dive into our comprehensive review of the latest RPG release. We cover gameplay mechanics, graphics, story, and whether it's worth your time and money.");
        post8.setAuthor(admin);
        post8.setCategory(categories[(int)(Math.random() * categories.length)]);
        postRepository.save(post8);
        
        System.out.println("Sample data initialized successfully!");
        System.out.println("Users: " + userRepository.count());
        System.out.println("Categories: " + categoryRepository.count());
        System.out.println("Posts: " + postRepository.count());
    }
}

