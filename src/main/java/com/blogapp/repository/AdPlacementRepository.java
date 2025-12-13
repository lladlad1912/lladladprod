package com.blogapp.repository;

import com.blogapp.model.AdPlacement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdPlacementRepository extends JpaRepository<AdPlacement, Long> {
    List<AdPlacement> findByPositionOrderByDisplayOrderAsc(String position);
    List<AdPlacement> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<AdPlacement> findByPositionAndIsActiveTrueOrderByDisplayOrderAsc(String position);
}












