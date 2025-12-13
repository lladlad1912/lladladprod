package com.blogapp.service;

import com.blogapp.dto.PostStatisticsDTO;
import com.blogapp.model.Post;
import com.blogapp.model.PostView;
import com.blogapp.model.User;
import com.blogapp.repository.PostRepository;
import com.blogapp.repository.PostViewRepository;
import com.blogapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostViewService {
    
    @Autowired
    private PostViewRepository postViewRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private GeolocationService geolocationService;
    
    @Transactional
    public void trackPostView(Long postId, Long userId, HttpServletRequest request, String country, String city, String region) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        PostView postView = new PostView();
        postView.setPost(post);
        
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            postView.setUser(user);
        }
        
        // Get IP address
        String ipAddress = getClientIpAddress(request);
        postView.setIpAddress(ipAddress);
        
        // Get location data from geolocation service if not provided
        if (country == null || city == null || region == null) {
            GeolocationService.LocationInfo locationInfo = geolocationService.getLocationFromIp(ipAddress);
            postView.setCountry(locationInfo.getCountry());
            postView.setCity(locationInfo.getCity());
            postView.setRegion(locationInfo.getRegion());
        } else {
            postView.setCountry(country);
            postView.setCity(city);
            postView.setRegion(region);
        }
        
        // Get user agent
        String userAgent = request.getHeader("User-Agent");
        postView.setUserAgent(userAgent);
        
        // Get referrer
        String referrer = request.getHeader("Referer");
        postView.setReferrer(referrer);
        
        postViewRepository.save(postView);
        
        // Also increment the post's view count
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Handle multiple IPs (X-Forwarded-For can contain multiple IPs)
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
    
    public PostStatisticsDTO getPostStatistics(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        PostStatisticsDTO stats = new PostStatisticsDTO();
        stats.setPostId(postId);
        stats.setPostTitle(post.getTitle());
        stats.setTotalViews(postViewRepository.countByPostId(postId));
        stats.setUniqueVisitors(postViewRepository.countUniqueVisitorsByPostId(postId));
        
        // Get views by country
        List<Object[]> countryData = postViewRepository.getViewsByCountry(postId);
        List<PostStatisticsDTO.CountryViewDTO> countryViews = countryData.stream()
                .map(data -> new PostStatisticsDTO.CountryViewDTO(
                        (String) data[0],
                        (Long) data[1]
                ))
                .collect(Collectors.toList());
        stats.setViewsByCountry(countryViews);
        
        // Get views by city
        List<Object[]> cityData = postViewRepository.getViewsByCity(postId);
        List<PostStatisticsDTO.CityViewDTO> cityViews = new ArrayList<>();
        for (Object[] data : cityData) {
            // Get country for this city from a sample view
            PostView sampleView = postViewRepository.findByPostId(postId).stream()
                    .filter(pv -> pv.getCity() != null && pv.getCity().equals(data[0]))
                    .findFirst()
                    .orElse(null);
            String country = sampleView != null ? sampleView.getCountry() : "Unknown";
            cityViews.add(new PostStatisticsDTO.CityViewDTO(
                    (String) data[0],
                    country,
                    (Long) data[1]
            ));
        }
        stats.setViewsByCity(cityViews);
        
        // Get views by date
        List<Object[]> dateData = postViewRepository.getViewsByDate(postId);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        List<PostStatisticsDTO.DateViewDTO> dateViews = dateData.stream()
                .map(data -> {
                    String dateStr;
                    if (data[0] instanceof LocalDateTime) {
                        dateStr = ((LocalDateTime) data[0]).format(formatter);
                    } else if (data[0] instanceof java.sql.Date) {
                        dateStr = ((java.sql.Date) data[0]).toLocalDate().format(formatter);
                    } else {
                        dateStr = data[0].toString();
                    }
                    return new PostStatisticsDTO.DateViewDTO(dateStr, (Long) data[1]);
                })
                .collect(Collectors.toList());
        stats.setViewsByDate(dateViews);
        
        // Get recent views (last 50)
        List<PostView> recentViews = postViewRepository.getRecentViewsByPostId(postId)
                .stream()
                .limit(50)
                .collect(Collectors.toList());
        
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        List<PostStatisticsDTO.PostViewDetailDTO> viewDetails = recentViews.stream()
                .map(pv -> new PostStatisticsDTO.PostViewDetailDTO(
                        pv.getId(),
                        pv.getUser() != null ? pv.getUser().getUsername() : "Anonymous",
                        pv.getIpAddress(),
                        pv.getCountry() != null ? pv.getCountry() : "Unknown",
                        pv.getCity() != null ? pv.getCity() : "Unknown",
                        pv.getRegion() != null ? pv.getRegion() : "Unknown",
                        pv.getViewedAt().format(dateTimeFormatter),
                        pv.getUserAgent() != null ? pv.getUserAgent() : "Unknown"
                ))
                .collect(Collectors.toList());
        stats.setRecentViews(viewDetails);
        
        return stats;
    }
    
    public List<PostStatisticsDTO> getAllPostsStatistics() {
        List<Post> posts = postRepository.findAll();
        return posts.stream()
                .map(post -> {
                    PostStatisticsDTO stats = new PostStatisticsDTO();
                    stats.setPostId(post.getId());
                    stats.setPostTitle(post.getTitle());
                    stats.setTotalViews(postViewRepository.countByPostId(post.getId()));
                    stats.setUniqueVisitors(postViewRepository.countUniqueVisitorsByPostId(post.getId()));
                    return stats;
                })
                .collect(Collectors.toList());
    }
}

