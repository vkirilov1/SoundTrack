package org.soundtrack.client;

import java.util.List;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

public final class HttpClients {

  private HttpClients() {}

  public static RestTemplate createRestTemplate() {
    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(10_000);
    factory.setReadTimeout(30_000);
    return new RestTemplate(factory);
  }

  public static HttpEntity<Void> buildHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.set("User-Agent", "soundtrack-app/1.0 soundtrack.devs@gmail.com");
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    return new HttpEntity<>(headers);
  }
}
