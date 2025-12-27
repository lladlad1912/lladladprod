package com.blogapp.service;

import com.blogapp.model.SiteSettings;
import com.blogapp.repository.SiteSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class SiteSettingsService {
    
    @Autowired
    private SiteSettingsRepository settingsRepository;
    
    public Map<String, String> getAllSettings() {
        List<SiteSettings> settings = settingsRepository.findAll();
        Map<String, String> settingsMap = new HashMap<>();
        for (SiteSettings setting : settings) {
            settingsMap.put(setting.getKey(), setting.getValue());
        }
        return settingsMap;
    }
    
    public String getSetting(String key) {
        return settingsRepository.findByKey(key)
                .map(SiteSettings::getValue)
                .orElse(null);
    }
    
    public SiteSettings setSetting(String key, String value, String description) {
        SiteSettings setting = settingsRepository.findByKey(key).orElse(new SiteSettings());
        setting.setKey(key);
        setting.setValue(value);
        if (description != null) {
            setting.setDescription(description);
        }
        return settingsRepository.save(setting);
    }
    
    public void deleteSetting(String key) {
        settingsRepository.findByKey(key).ifPresent(settingsRepository::delete);
    }
}























