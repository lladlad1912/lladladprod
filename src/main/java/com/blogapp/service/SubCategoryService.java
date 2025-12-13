package com.blogapp.service;

import com.blogapp.dto.SubCategoryDTO;
import com.blogapp.model.Category;
import com.blogapp.model.SubCategory;
import com.blogapp.repository.CategoryRepository;
import com.blogapp.repository.SubCategoryRepository;
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
public class SubCategoryService {
    
    @Autowired
    private SubCategoryRepository subCategoryRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Cacheable(value = "subcategories", key = "'all'")
    public List<SubCategoryDTO> getAllSubCategories() {
        return subCategoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Cacheable(value = "subcategories", key = "#categoryId")
    public List<SubCategoryDTO> getSubCategoriesByCategory(Long categoryId) {
        return subCategoryRepository.findByCategoryId(categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Cacheable(value = "subcategories", key = "#id")
    public SubCategoryDTO getSubCategoryById(Long id) {
        SubCategory subCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubCategory not found with id: " + id));
        return convertToDTO(subCategory);
    }
    
    @CacheEvict(value = "subcategories", allEntries = true)
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public SubCategoryDTO createSubCategory(SubCategory subCategory) {
        // Fetch the category from database to ensure it's a managed entity with version
        Category category = categoryRepository.findById(subCategory.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + subCategory.getCategory().getId()));
        
        if (subCategoryRepository.existsByNameAndCategoryId(
                subCategory.getName(), category.getId())) {
            throw new RuntimeException("SubCategory name already exists for this category");
        }
        
        // Set the managed category entity
        subCategory.setCategory(category);
        SubCategory savedSubCategory = subCategoryRepository.save(subCategory);
        return convertToDTO(savedSubCategory);
    }
    
    @CacheEvict(value = "subcategories", key = "#id")
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public SubCategoryDTO updateSubCategory(Long id, SubCategory subCategoryDetails) {
        SubCategory subCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubCategory not found with id: " + id));
        
        if (subCategoryDetails.getName() != null) {
            // Check if name already exists for this category (excluding current subcategory)
            if (!subCategory.getName().equals(subCategoryDetails.getName()) &&
                subCategoryRepository.existsByNameAndCategoryId(
                    subCategoryDetails.getName(), subCategory.getCategory().getId())) {
                throw new RuntimeException("SubCategory name already exists for this category");
            }
            subCategory.setName(subCategoryDetails.getName());
        }
        
        if (subCategoryDetails.getDescription() != null) {
            subCategory.setDescription(subCategoryDetails.getDescription());
        }
        
        if (subCategoryDetails.getCategory() != null) {
            // Fetch the category from database to ensure it's a managed entity with version
            Category category = categoryRepository.findById(subCategoryDetails.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + subCategoryDetails.getCategory().getId()));
            subCategory.setCategory(category);
        }
        
        SubCategory updatedSubCategory = subCategoryRepository.save(subCategory);
        return convertToDTO(updatedSubCategory);
    }
    
    @CacheEvict(value = "subcategories", allEntries = true)
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void deleteSubCategory(Long id) {
        SubCategory subCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubCategory not found with id: " + id));
        subCategoryRepository.delete(subCategory);
    }
    
    private SubCategoryDTO convertToDTO(SubCategory subCategory) {
        SubCategoryDTO dto = new SubCategoryDTO();
        dto.setId(subCategory.getId());
        dto.setName(subCategory.getName());
        dto.setDescription(subCategory.getDescription());
        dto.setCategoryId(subCategory.getCategory().getId());
        dto.setCategoryName(subCategory.getCategory().getName());
        dto.setCreatedAt(subCategory.getCreatedAt());
        dto.setUpdatedAt(subCategory.getUpdatedAt());
        return dto;
    }
}

