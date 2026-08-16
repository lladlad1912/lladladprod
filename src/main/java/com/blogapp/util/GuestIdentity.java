package com.blogapp.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;

public final class GuestIdentity {

    private GuestIdentity() {
    }

    public static String normalizeName(String name) {
        return name == null ? "" : name.trim().replaceAll("\\s+", " ");
    }

    public static String hash(String name, String guestKey, String pepper) {
        String material = normalizeName(name).toLowerCase(Locale.ROOT) + "\n" + (guestKey == null ? "" : guestKey)
                + "\n" + (pepper == null ? "" : pepper);
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(material.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is required for guest comments", e);
        }
    }
}
