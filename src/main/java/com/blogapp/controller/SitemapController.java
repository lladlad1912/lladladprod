package com.blogapp.controller;

import com.blogapp.model.Category;
import com.blogapp.model.Post;
import com.blogapp.repository.CategoryRepository;
import com.blogapp.repository.PostRepository;
import com.blogapp.util.SlugUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
public class SitemapController {
    
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Value("${app.site.url:http://localhost:3000}")
    private String siteUrl;
    
    private static final DateTimeFormatter W3C_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String generateSitemap() {
        StringBuilder sitemap = new StringBuilder();
        sitemap.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sitemap.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        
        // Homepage
        sitemap.append("  <url>\n");
        sitemap.append("    <loc>").append(escapeXml(siteUrl)).append("/</loc>\n");
        sitemap.append("    <lastmod>").append(LocalDateTime.now().format(W3C_DATE_FORMAT)).append("</lastmod>\n");
        sitemap.append("    <changefreq>daily</changefreq>\n");
        sitemap.append("    <priority>1.0</priority>\n");
        sitemap.append("  </url>\n");

        sitemap.append("  <url>\n");
        sitemap.append("    <loc>").append(escapeXml(siteUrl)).append("/sitemap</loc>\n");
        sitemap.append("    <lastmod>").append(LocalDateTime.now().format(W3C_DATE_FORMAT)).append("</lastmod>\n");
        sitemap.append("    <changefreq>weekly</changefreq>\n");
        sitemap.append("    <priority>0.4</priority>\n");
        sitemap.append("  </url>\n");
        
        for (Category category : categoryRepository.findAll()) {
            sitemap.append("  <url>\n");
            sitemap.append("    <loc>").append(escapeXml(siteUrl)).append(categoryPath(category)).append("</loc>\n");
            sitemap.append("    <lastmod>").append(LocalDateTime.now().format(W3C_DATE_FORMAT)).append("</lastmod>\n");
            sitemap.append("    <changefreq>daily</changefreq>\n");
            sitemap.append("    <priority>0.8</priority>\n");
            sitemap.append("  </url>\n");
        }
        
        List<Post> publishedPosts = postRepository.findAllByStatusOrderByCreatedAtDesc("PUBLISHED");
        for (Post post : publishedPosts) {
            sitemap.append("  <url>\n");
            sitemap.append("    <loc>").append(escapeXml(siteUrl)).append(postPath(post)).append("</loc>\n");
            sitemap.append("    <lastmod>").append(
                (post.getUpdatedAt() != null ? post.getUpdatedAt() : post.getCreatedAt())
                    .format(W3C_DATE_FORMAT)
            ).append("</lastmod>\n");
            sitemap.append("    <changefreq>weekly</changefreq>\n");
            sitemap.append("    <priority>0.7</priority>\n");
            sitemap.append("  </url>\n");
        }
        
        sitemap.append("</urlset>");
        return sitemap.toString();
    }
    
    @GetMapping(value = "/sitemap.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public String generateSitemapTxt() {
        StringBuilder sitemap = new StringBuilder();
        sitemap.append(siteUrl).append("/\n");
        sitemap.append(siteUrl).append("/sitemap\n");
        for (Category category : categoryRepository.findAll()) {
            sitemap.append(siteUrl).append(categoryPath(category)).append("\n");
        }
        List<Post> publishedPosts = postRepository.findAllByStatusOrderByCreatedAtDesc("PUBLISHED");
        for (Post post : publishedPosts) {
            sitemap.append(siteUrl).append(postPath(post)).append("\n");
        }
        return sitemap.toString();
    }

    private String postPath(Post post) {
        if (post.getSlug() != null && !post.getSlug().isBlank()) {
            return "/posts/" + post.getSlug();
        }
        return "/posts/" + post.getId();
    }

    private String categoryPath(Category category) {
        if (category.getSlug() != null && !category.getSlug().isBlank()) {
            return "/category/" + category.getSlug();
        }
        return "/category/" + SlugUtils.slugify(category.getName(), "category");
    }

    private String escapeXml(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
