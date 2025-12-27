package com.blogapp.service;

import com.blogapp.model.AdPlacement;
import com.blogapp.repository.AdPlacementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdPlacementService {
    
    @Autowired
    private AdPlacementRepository adRepository;
    
    public List<AdPlacement> getAllAds() {
        return adRepository.findAll();
    }
    
    public List<AdPlacement> getActiveAds() {
        return adRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }
    
    public List<AdPlacement> getAdsByPosition(String position) {
        return adRepository.findByPositionAndIsActiveTrueOrderByDisplayOrderAsc(position);
    }
    
    public AdPlacement createAd(AdPlacement ad) {
        if (ad.getDisplayOrder() == null) {
            // Set display order to be last
            List<AdPlacement> existingAds = adRepository.findByPositionOrderByDisplayOrderAsc(ad.getPosition());
            int maxOrder = existingAds.stream()
                    .mapToInt(a -> a.getDisplayOrder() != null ? a.getDisplayOrder() : 0)
                    .max()
                    .orElse(0);
            ad.setDisplayOrder(maxOrder + 1);
        }
        return adRepository.save(ad);
    }
    
    public AdPlacement updateAd(Long id, AdPlacement adDetails) {
        AdPlacement ad = adRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ad placement not found"));
        
        if (adDetails.getAdCode() != null) {
            ad.setAdCode(adDetails.getAdCode());
        }
        if (adDetails.getPlacementName() != null) {
            ad.setPlacementName(adDetails.getPlacementName());
        }
        if (adDetails.getPosition() != null) {
            ad.setPosition(adDetails.getPosition());
        }
        if (adDetails.getDisplayOrder() != null) {
            ad.setDisplayOrder(adDetails.getDisplayOrder());
        }
        if (adDetails.getIsActive() != null) {
            ad.setIsActive(adDetails.getIsActive());
        }
        if (adDetails.getWidth() != null) {
            ad.setWidth(adDetails.getWidth());
        }
        if (adDetails.getHeight() != null) {
            ad.setHeight(adDetails.getHeight());
        }
        
        return adRepository.save(ad);
    }
    
    public void deleteAd(Long id) {
        adRepository.deleteById(id);
    }
    
    public void updateAdOrder(List<AdPlacement> ads) {
        for (int i = 0; i < ads.size(); i++) {
            AdPlacement ad = ads.get(i);
            ad.setDisplayOrder(i + 1);
            adRepository.save(ad);
        }
    }
}























