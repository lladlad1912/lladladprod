package com.blogapp.controller;

import com.blogapp.dto.SubCategoryDTO;
import com.blogapp.model.Category;
import com.blogapp.model.SubCategory;
import com.blogapp.service.SubCategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcategories")
public class SubCategoryController {
    
    @Autowired
    private SubCategoryService subCategoryService;
    
    @GetMapping
    public ResponseEntity<List<SubCategoryDTO>> getAllSubCategories() {
        List<SubCategoryDTO> subCategories = subCategoryService.getAllSubCategories();
        return ResponseEntity.ok(subCategories);
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<SubCategoryDTO>> getSubCategoriesByCategory(@PathVariable Long categoryId) {
        List<SubCategoryDTO> subCategories = subCategoryService.getSubCategoriesByCategory(categoryId);
        return ResponseEntity.ok(subCategories);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SubCategoryDTO> getSubCategoryById(@PathVariable Long id) {
        try {
            SubCategoryDTO subCategory = subCategoryService.getSubCategoryById(id);
            return ResponseEntity.ok(subCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSubCategory(@Valid @RequestBody SubCategory subCategory) {
        try {
            SubCategoryDTO createdSubCategory = subCategoryService.createSubCategory(subCategory);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSubCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateSubCategory(@PathVariable Long id, @Valid @RequestBody SubCategory subCategory) {
        try {
            SubCategoryDTO updatedSubCategory = subCategoryService.updateSubCategory(id, subCategory);
            return ResponseEntity.ok(updatedSubCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSubCategory(@PathVariable Long id) {
        try {
            subCategoryService.deleteSubCategory(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
























