package com.apexcare.security;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
@Configuration
public class SecurityConfig {
 @Bean SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  return http.csrf(c->c.disable()).cors(c->{}).formLogin(f->f.disable()).httpBasic(b->b.disable())
   .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .authorizeHttpRequests(a->a.requestMatchers(HttpMethod.OPTIONS,"/**").permitAll().requestMatchers("/actuator/health","/internal/**").permitAll().anyRequest().authenticated())
   .addFilterBefore(new JwtFilter(), UsernamePasswordAuthenticationFilter.class).build();
 }
 static class JwtFilter extends OncePerRequestFilter {
  @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain) throws ServletException,IOException {
   String header=req.getHeader("Authorization");
   if(header!=null && header.startsWith("Bearer ")) {
    try {
     String subject=JwtUtil.parse(header.substring(7)).getSubject();
     UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
    subject, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
);     SecurityContextHolder.getContext().setAuthentication(auth);
    } catch(Exception ex) { res.setStatus(401);res.setContentType("application/json");res.getWriter().write("{\"error\":\"Invalid or expired token\"}");return; }
   }
   chain.doFilter(req,res);
  }
 }
}
