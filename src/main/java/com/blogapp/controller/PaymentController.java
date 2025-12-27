package com.blogapp.controller;

import com.blogapp.dto.payment.CreateRazorpayOrderRequest;
import com.blogapp.dto.payment.CreateRazorpayOrderResponse;
import com.blogapp.dto.payment.VerifyRazorpayPaymentRequest;
import com.blogapp.dto.payment.VerifyRazorpayPaymentResponse;
import com.blogapp.service.RazorpayPaymentService;
import com.razorpay.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private final RazorpayPaymentService razorpayPaymentService;

    public PaymentController(RazorpayPaymentService razorpayPaymentService) {
        this.razorpayPaymentService = razorpayPaymentService;
    }

    @PostMapping("/razorpay/order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody CreateRazorpayOrderRequest request) {
        try {
            Order order = razorpayPaymentService.createOrder(request);
            String orderId = order.get("id");
            long amount = ((Number) order.get("amount")).longValue();
            String currency = order.get("currency");
            return ResponseEntity.ok(new CreateRazorpayOrderResponse(
                    razorpayPaymentService.getKeyId(),
                    orderId,
                    amount,
                    currency
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new java.util.HashMap<String, Object>() {{
                put("message", e.getMessage());
            }});
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new java.util.HashMap<String, Object>() {{
                put("message", "Failed to create order: " + e.getMessage());
            }});
        }
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<VerifyRazorpayPaymentResponse> verifyRazorpayPayment(@RequestBody VerifyRazorpayPaymentRequest request) {
        boolean verified = razorpayPaymentService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );
        return ResponseEntity.ok(new VerifyRazorpayPaymentResponse(verified));
    }
}


