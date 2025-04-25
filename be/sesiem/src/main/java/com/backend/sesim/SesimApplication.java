package com.backend.sesim;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class SesimApplication {
	public static void main(String[] args) {
		SpringApplication.run(SesimApplication.class, args);
	}

}
