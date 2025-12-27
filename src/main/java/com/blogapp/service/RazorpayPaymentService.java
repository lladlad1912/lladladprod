package com.blogapp.service;

import com.blogapp.dto.payment.CreateRazorpayOrderRequest;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Service
public class RazorpayPaymentService {

    private final String keyId;
    private final String keySecret;

    public RazorpayPaymentService(
            @Value("${razorpay.key-id:}") String keyId,
            @Value("${razorpay.key-secret:}") String keySecret
    ) {
        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    public String getKeyId() {
        return keyId;
    }

    public Order createOrder(CreateRazorpayOrderRequest req) throws Exception {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            throw new IllegalStateException("Razorpay keys are not configured. Set razorpay.key-id and razorpay.key-secret.");
        }

        long amount = Math.max(1, req.getAmount());
        String currency = (req.getCurrency() == null || req.getCurrency().isBlank()) ? "INR" : req.getCurrency().trim();

        RazorpayClient client = new RazorpayClient(keyId, keySecret);
        JSONObject options = new JSONObject();
        options.put("amount", amount);
        options.put("currency", currency);
        if (req.getReceipt() != null && !req.getReceipt().isBlank()) {
            options.put("receipt", req.getReceipt().trim());
        }
        return client.orders.create(options);
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        if (keySecret == null || keySecret.isBlank()) return false;
        if (orderId == null || paymentId == null || signature == null) return false;
        try {
            String payload = orderId + "|" + paymentId;
            String expected = hmacSha256Hex(payload, keySecret);
            return constantTimeEquals(expected, signature);
        } catch (Exception e) {
            return false;
        }
    }

    private static String hmacSha256Hex(String data, String secret) throws Exception {
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(keySpec);
        byte[] raw = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(raw.length * 2);
        for (byte b : raw) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}











