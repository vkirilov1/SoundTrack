package org.soundtrack.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "org.soundtrack")
@EntityScan(basePackages = "org.soundtrack.domain.model")
@EnableJpaRepositories(basePackages = "org.soundtrack.domain.repository")
@EnableScheduling
public class SoundtrackApiApplication {

  public static void main(String[] args) {
    SpringApplication.run(SoundtrackApiApplication.class, args);
  }
}
