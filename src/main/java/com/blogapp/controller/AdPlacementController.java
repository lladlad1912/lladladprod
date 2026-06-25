package com.blogapp.controller;

import com.blogapp.model.AdPlacement;
import com.blogapp.service.AdPlacementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ads")
public class AdPlacementController {
    
    @Autowired
    private AdPlacementService adService;
    
    @GetMapping
    public ResponseEntity<List<AdPlacement>> getAllAds() {
        return ResponseEntity.ok(adService.getAllAds());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<AdPlacement>> getActiveAds() {
        return ResponseEntity.ok(adService.getActiveAds());
    }
    
    @GetMapping("/position/{position}")
    public ResponseEntity<List<AdPlacement>> getAdsByPosition(@PathVariable String position) {
        return ResponseEntity.ok(adService.getAdsByPosition(position));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdPlacement> createAd(@RequestBody AdPlacement ad) {
        return ResponseEntity.ok(adService.createAd(ad));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdPlacement> updateAd(@PathVariable Long id, @RequestBody AdPlacement ad) {
        return ResponseEntity.ok(adService.updateAd(id, ad));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAd(@PathVariable Long id) {
        adService.deleteAd(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reorderAds(@RequestBody List<AdPlacement> ads) {
        adService.updateAdOrder(ads);
        return ResponseEntity.ok(Map.of("success", true));
    }
}


























