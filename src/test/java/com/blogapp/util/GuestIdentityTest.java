package com.blogapp.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class GuestIdentityTest {

    @Test
    void sameNameAndKeyProduceTheSameHash() {
        String pepper = "test-pepper";
        String first = GuestIdentity.hash("Ada Lovelace", "secret-key", pepper);
        String second = GuestIdentity.hash("  ada   lovelace ", "secret-key", pepper);
        assertEquals(first, second);
    }

    @Test
    void differentKeysDoNotMatch() {
        String pepper = "test-pepper";
        String first = GuestIdentity.hash("Ada", "key-one", pepper);
        String second = GuestIdentity.hash("Ada", "key-two", pepper);
        assertNotEquals(first, second);
    }
}
