package com.blogapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostStatisticsDTO {
    private Long postId;
    private String postTitle;
    private Long totalViews;
    private Long uniqueVisitors;
    private List<CountryViewDTO> viewsByCountry;
    private List<CityViewDTO> viewsByCity;
    private List<DateViewDTO> viewsByDate;
    private List<PostViewDetailDTO> recentViews;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CountryViewDTO {
        private String country;
        private Long count;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CityViewDTO {
        private String city;
        private String country;
        private Long count;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DateViewDTO {
        private String date;
        private Long count;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostViewDetailDTO {
        private Long id;
        private String username;
        private String ipAddress;
        private String country;
        private String city;
        private String region;
        private String viewedAt;
        private String userAgent;
    }
}

