package com.blogapp.controller;

import com.blogapp.service.SiteSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SiteSettingsController {
    
    @Autowired
    private SiteSettingsService settingsService;
    
    @GetMapping
    public ResponseEntity<Map<String, String>> getAllSettings() {
        return ResponseEntity.ok(settingsService.getAllSettings());
    }
    
    @GetMapping("/{key}")
    public ResponseEntity<Map<String, String>> getSetting(@PathVariable String key) {
        String value = settingsService.getSetting(key);
        return ResponseEntity.ok(Map.of("key", key, "value", value != null ? value : ""));
    }
    
    @PutMapping("/{key}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ResponseEntity<?> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> request) {
        String value = request.get("value");
        String description = request.get("description");
        settingsService.setSetting(key, value, description);
        return ResponseEntity.ok(Map.of("success", true, "message", "Setting updated"));
    }
}














