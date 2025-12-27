package com.blogapp.dto.payment;

import lombok.Data;

@Data
public class VerifyRazorpayPaymentRequest {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}











