package com.blogapp.dto.payment;

import lombok.Data;

/**
 * Amount is in the smallest currency unit (paise for INR).
 */
@Data
public class CreateRazorpayOrderRequest {
    private long amount;
    private String currency; // e.g. INR
    private String receipt;  // optional
}











