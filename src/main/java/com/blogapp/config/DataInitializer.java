package com.blogapp.config;

import com.blogapp.model.Category;
import com.blogapp.model.Post;
import com.blogapp.model.User;
import com.blogapp.repository.CategoryRepository;
import com.blogapp.repository.PostRepository;
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
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Only initialize if database is empty
        if (userRepository.count() == 0) {
            initializeData();
        }
    }
    
    private void initializeData() {
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
        
        // Create sample categories
        Category techCategory = new Category();
        techCategory.setName("Technology");
        techCategory.setDescription("Posts about technology, programming, and software development");
        techCategory = categoryRepository.save(techCategory);
        
        Category travelCategory = new Category();
        travelCategory.setName("Travel");
        travelCategory.setDescription("Travel experiences and destination guides");
        travelCategory = categoryRepository.save(travelCategory);
        
        Category foodCategory = new Category();
        foodCategory.setName("Food");
        foodCategory.setDescription("Recipes, restaurant reviews, and culinary adventures");
        foodCategory = categoryRepository.save(foodCategory);
        
        // Create sample posts
        Post post1 = new Post();
        post1.setTitle("Getting Started with Spring Boot");
        post1.setContent("Spring Boot is a powerful framework that makes it easy to create stand-alone, production-grade Spring-based applications. In this post, we'll explore the basics of Spring Boot and how to get started with your first application.");
        post1.setYoutubeUrl("https://www.youtube.com/watch?v=vtPkZShrvXQ");
        post1.setAuthor(user1);
        post1.setCategory(techCategory);
        postRepository.save(post1);
        
        Post post2 = new Post();
        post2.setTitle("Top 10 Travel Destinations for 2024");
        post2.setContent("Looking for your next adventure? Here are the top 10 travel destinations you should consider visiting in 2024. From tropical beaches to historic cities, there's something for everyone.");
        post2.setAuthor(user2);
        post2.setCategory(travelCategory);
        postRepository.save(post2);
        
        Post post3 = new Post();
        post3.setTitle("Delicious Homemade Pizza Recipe");
        post3.setContent("Learn how to make the perfect homemade pizza with this easy-to-follow recipe. We'll cover everything from making the dough to choosing the best toppings.");
        post3.setYoutubeUrl("https://youtu.be/dQw4w9WgXcQ");
        post3.setAuthor(user1);
        post3.setCategory(foodCategory);
        postRepository.save(post3);
        
        System.out.println("Sample data initialized successfully!");
        System.out.println("Users: " + userRepository.count());
        System.out.println("Categories: " + categoryRepository.count());
        System.out.println("Posts: " + postRepository.count());
    }
}

