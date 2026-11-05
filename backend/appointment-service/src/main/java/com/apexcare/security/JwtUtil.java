package com.apexcare.security;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
public final class JwtUtil {
 private JwtUtil() {}
 private static SecretKey key() {
  String secret=System.getenv().getOrDefault("JWT_SECRET","change-this-demo-secret-to-a-long-random-value-123456");
  return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
 }
 public static Claims parse(String token) {
  return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
 }
 public static String create(String subject) {
  long now=System.currentTimeMillis();
  return Jwts.builder().subject(subject).issuedAt(new Date(now)).expiration(new Date(now+1000L*60*60*8)).signWith(key()).compact();
 }
}
