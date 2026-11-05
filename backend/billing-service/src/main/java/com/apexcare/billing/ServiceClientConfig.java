package com.apexcare.billing;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.web.client.RestTemplate;
@Configuration public class ServiceClientConfig {
  @Bean @LoadBalanced RestTemplate restTemplate(){return new RestTemplate();}
}
