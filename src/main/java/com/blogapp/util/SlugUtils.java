package com.blogapp.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;

public final class SlugUtils {

    private static final Set<String> RESERVED = Set.of(
            "new", "edit", "drafts", "search", "stats", "category", "user",
            "sitemap", "login", "register", "profile", "admin", "products",
            "pending-review", "for-review"
    );

    private SlugUtils() {
    }

    public static String slugify(String input) {
        return slugify(input, "post");
    }

    public static String slugify(String input, String fallback) {
        String base = fallback == null || fallback.isBlank() ? "post" : fallback;
        if (input == null || input.isBlank()) {
            return base;
        }

        String slug = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");

        if (slug.length() > 80) {
            slug = slug.substring(0, 80).replaceAll("-+$", "");
        }
        if (slug.isEmpty()) {
            slug = base;
        }
        if (RESERVED.contains(slug) || slug.matches("\\d+")) {
            slug = slug + "-" + base;
        }
        return slug;
    }
}
