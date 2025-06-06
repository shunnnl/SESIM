package com.backend.sesiem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class SesiemApplication {
	public static void main(String[] args) {
		SpringApplication.run(SesiemApplication.class, args);
	}

}
