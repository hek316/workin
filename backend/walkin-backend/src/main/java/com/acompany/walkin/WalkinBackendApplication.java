package com.acompany.walkin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class WalkinBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(WalkinBackendApplication.class, args);
	}

}
