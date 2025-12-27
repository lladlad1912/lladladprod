package com.blogapp.service;

import com.blogapp.dto.CategoryDTO;
import com.blogapp.model.Category;
import com.blogapp.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(isolation = Isolation.READ_COMMITTED)
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Cacheable(value = "categories", key = "'all'")
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Cacheable(value = "categories", key = "#id")
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return convertToDTO(category);
    }
    
    @CacheEvict(value = "categories", allEntries = true)
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public CategoryDTO createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Category name already exists");
        }
        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }
    
    // Updating a category can affect the list view (and header categories), so evict all cached entries.
    @CacheEvict(value = "categories", allEntries = true)
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public CategoryDTO updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        if (categoryDetails.getName() != null && !categoryDetails.getName().equals(category.getName())) {
            if (categoryRepository.existsByName(categoryDetails.getName())) {
                throw new RuntimeException("Category name already exists");
            }
            category.setName(categoryDetails.getName());
        }
        
        if (categoryDetails.getDescription() != null) {
            category.setDescription(categoryDetails.getDescription());
        }

        // Allow toggling whether category appears in header (only when provided)
        if (categoryDetails.getShowInHeader() != null) {
            category.setShowInHeader(categoryDetails.getShowInHeader());
        }
        
        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }
    
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }
    
    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setShowInHeader(Boolean.TRUE.equals(category.getShowInHeader()));
        dto.setCreatedAt(category.getCreatedAt());
        dto.setPostCount((long) category.getPosts().size());
        return dto;
    }
}

