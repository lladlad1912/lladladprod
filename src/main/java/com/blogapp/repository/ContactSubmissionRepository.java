package com.blogapp.repository;

import com.blogapp.model.ContactSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactSubmissionRepository extends JpaRepository<ContactSubmission, Long> {
    List<ContactSubmission> findByOrderByCreatedAtDesc();
    List<ContactSubmission> findBySubmissionTypeOrderByCreatedAtDesc(String submissionType);
    List<ContactSubmission> findByIsReadFalseOrderByCreatedAtDesc();
}























