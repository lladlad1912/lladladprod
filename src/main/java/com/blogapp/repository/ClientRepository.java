package com.blogapp.repository;

import com.blogapp.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<Client> findByServiceCategoryAndIsActiveTrueOrderByDisplayOrderAsc(String serviceCategory);
    List<Client> findAllByOrderByDisplayOrderAsc();
}
