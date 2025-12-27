package com.blogapp.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateRazorpayOrderResponse {
    private String keyId;
    private String orderId;
    private long amount;
    private String currency;
}











