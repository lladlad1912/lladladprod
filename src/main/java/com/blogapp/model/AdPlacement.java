package com.blogapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ad_placements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdPlacement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "ad_code", columnDefinition = "TEXT")
    private String adCode; // Google AdSense code or custom HTML
    
    @Column(name = "placement_name")
    private String placementName; // e.g., "Header", "Sidebar", "Footer", "Between Posts"
    
    @Column(name = "position")
    private String position; // e.g., "header", "sidebar-top", "post-content", "footer"
    
    @Column(name = "display_order")
    private Integer displayOrder; // For ordering multiple ads in same position
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "width")
    private String width; // e.g., "300px", "100%"
    
    @Column(name = "height")
    private String height; // e.g., "250px", "auto"
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Version
    @Column(name = "version")
    private Long version;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}























