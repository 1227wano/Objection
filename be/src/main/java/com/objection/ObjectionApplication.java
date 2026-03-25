package com.objection;

import com.objection.security.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class ObjectionApplication {

    public static void main(String[] args) {
        SpringApplication.run(ObjectionApplication.class, args);
    }

}
