package org.soundtrack.api.common.exception;

import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(ResourceNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public ErrorResponse handleNotFound(ResourceNotFoundException ex) {
    return new ErrorResponse(ex.getMessage());
  }

  @ExceptionHandler(ResourceExistsException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public ErrorResponse handleExists(ResourceExistsException ex) {
    return new ErrorResponse(ex.getMessage());
  }

  @ExceptionHandler(InvalidCredentialsException.class)
  @ResponseStatus(HttpStatus.UNAUTHORIZED)
  public ErrorResponse handleInvalidCredentials(InvalidCredentialsException ex) {
    return new ErrorResponse(ex.getMessage());
  }

  @ExceptionHandler(ForbiddenException.class)
  @ResponseStatus(HttpStatus.FORBIDDEN)
  public ErrorResponse handleForbidden(ForbiddenException ex) {
    return new ErrorResponse(ex.getMessage());
  }

  @ExceptionHandler(ChatRoomFullException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public ErrorResponse handleChatRoomFull(ChatRoomFullException ex) {
    return new ErrorResponse(ex.getMessage());
  }

  @ExceptionHandler(InvalidOperationException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ErrorResponse handleInvalidOperation(InvalidOperationException ex) {
    return new ErrorResponse(ex.getMessage());
  }

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ErrorResponse handleMaxUploadSize(MaxUploadSizeExceededException ex) {
    return new ErrorResponse("File is too large. Maximum size is 5MB");
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, String> handleValidation(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult()
        .getFieldErrors()
        .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
    return errors;
  }

  @ExceptionHandler(AsyncRequestNotUsableException.class)
  public void handleAsyncRequestNotUsable(AsyncRequestNotUsableException ex) {
    log.debug("Client disconnected from an async response: {}", ex.getMessage());
  }

  @ExceptionHandler(Exception.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public ErrorResponse handleGeneric(Exception ex) {
    log.error("Unhandled exception", ex);
    return new ErrorResponse("An unexpected error occurred");
  }

  public record ErrorResponse(String message) {}
}
