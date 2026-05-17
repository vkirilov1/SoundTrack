package org.soundtrack;

import org.soundtrack.service.ReleaseImportService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DataLoadApplication {

  public static void main(String[] args) {
    SpringApplication.run(DataLoadApplication.class, args);
  }

  @Bean
  CommandLineRunner run(ReleaseImportService importService) throws InterruptedException {
    return args -> {
      importService.importAllReleasesByYear(1969);
    };
  }
}
