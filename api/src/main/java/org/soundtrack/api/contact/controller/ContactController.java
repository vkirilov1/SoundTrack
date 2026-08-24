package org.soundtrack.api.contact.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.contact.dto.ContactRequestType;
import org.soundtrack.api.contact.service.ContactService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Tag(name = "Contact", description = "Relays a contact-form submission to the support inbox")
public class ContactController {

  private final ContactService contactService;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Submit a contact request",
      description =
          "Emails the submission to support. Works for both signed-in and anonymous visitors - an"
              + " anonymous submission must include an email to reply to.")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Submitted"),
    @ApiResponse(responseCode = "400", description = "Missing/invalid message, type, or email")
  })
  public ResponseEntity<Void> submit(
      @Parameter(description = "Request category") @RequestParam("type") ContactRequestType type,
      @Parameter(description = "The message body") @RequestParam("message") String message,
      @Parameter(description = "Required only for anonymous (logged-out) submissions")
          @RequestParam(value = "email", required = false)
          String email,
      @Parameter(description = "Optional JPEG/PNG screenshot")
          @RequestParam(value = "attachment", required = false)
          MultipartFile attachment,
      Authentication authentication) {
    contactService.submit(type, message, email, attachment, authentication);
    return ResponseEntity.noContent().build();
  }
}
