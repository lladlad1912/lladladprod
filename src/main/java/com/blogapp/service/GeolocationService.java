package com.blogapp.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GeolocationService {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String IP_API_URL = "http://ip-api.com/json/";
    
    public LocationInfo getLocationFromIp(String ipAddress) {
        // Skip localhost and private IPs
        if (ipAddress == null || ipAddress.startsWith("127.") || ipAddress.startsWith("192.168.") || 
            ipAddress.startsWith("10.") || ipAddress.startsWith("172.") || ipAddress.equals("localhost")) {
            return new LocationInfo("Unknown", "Unknown", "Unknown");
        }
        
        try {
            String url = IP_API_URL + ipAddress;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && "success".equals(response.get("status"))) {
                return new LocationInfo(
                    (String) response.getOrDefault("country", "Unknown"),
                    (String) response.getOrDefault("city", "Unknown"),
                    (String) response.getOrDefault("regionName", "Unknown")
                );
            }
        } catch (Exception e) {
            // If geolocation fails, return unknown
            System.err.println("Failed to get geolocation for IP: " + ipAddress + " - " + e.getMessage());
        }
        
        return new LocationInfo("Unknown", "Unknown", "Unknown");
    }
    
    public static class LocationInfo {
        private String country;
        private String city;
        private String region;
        
        public LocationInfo(String country, String city, String region) {
            this.country = country;
            this.city = city;
            this.region = region;
        }
        
        public String getCountry() { return country; }
        public String getCity() { return city; }
        public String getRegion() { return region; }
    }
}





















