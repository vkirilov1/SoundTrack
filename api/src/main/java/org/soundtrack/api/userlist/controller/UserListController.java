package org.soundtrack.api.userlist.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.userlist.dto.CreateUserListRequest;
import org.soundtrack.api.userlist.dto.UserListDetailResponse;
import org.soundtrack.api.userlist.dto.UserListSummaryResponse;
import org.soundtrack.api.userlist.service.UserListService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
@Tag(name = "User Lists", description = "Create and manage personal album lists")
public class UserListController {

  private final UserListService userListService;

  @GetMapping("/me")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get my lists",
      description = "Returns a paginated summary of the authenticated user's lists.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Lists returned"),
    @ApiResponse(responseCode = "401", description = "Not authenticated")
  })
  public PagedResponse<UserListSummaryResponse> getMyLists(
      @Parameter(description = "Zero-based page index")
          @RequestParam(name = "page", defaultValue = "0")
          int page,
      @Parameter(description = "Number of lists per page")
          @RequestParam(name = "size", defaultValue = "20")
          int size) {
    return userListService.getMyLists(page, size);
  }

  @GetMapping("/user/{userId}")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get lists by user",
      description = "Returns a paginated summary of all lists belonging to the given user.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Lists returned"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "404", description = "User not found")
  })
  public PagedResponse<UserListSummaryResponse> getUserLists(
      @Parameter(description = "Internal user ID") @PathVariable("userId") Long userId,
      @Parameter(description = "Zero-based page index")
          @RequestParam(name = "page", defaultValue = "0")
          int page,
      @Parameter(description = "Number of lists per page")
          @RequestParam(name = "size", defaultValue = "20")
          int size) {
    return userListService.getUserLists(userId, page, size);
  }

  @GetMapping("/{listId}")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get a list by ID",
      description = "Returns the full detail of a list including all its albums.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "List returned"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "404", description = "List not found")
  })
  public UserListDetailResponse getListById(
      @Parameter(description = "Internal list ID") @PathVariable("listId") Long listId) {
    return userListService.getListById(listId);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Create a list",
      description = "Creates a new personal album list for the authenticated user.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "List created"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated")
  })
  public UserListDetailResponse createList(@Valid @RequestBody CreateUserListRequest request) {
    return userListService.createList(request);
  }

  @PutMapping("/{listId}")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Update a list",
      description = "Updates the name and description of a list. Only the owner may update it.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "List updated"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not the list's owner"),
    @ApiResponse(responseCode = "404", description = "List not found")
  })
  public UserListDetailResponse updateList(
      @Parameter(description = "Internal list ID") @PathVariable("listId") Long listId,
      @Valid @RequestBody CreateUserListRequest request) {
    return userListService.updateList(listId, request);
  }

  @DeleteMapping("/{listId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Delete a list",
      description = "Deletes a list and all its album entries. Only the owner may delete it.")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "List deleted"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not the list's owner"),
    @ApiResponse(responseCode = "404", description = "List not found")
  })
  public void deleteList(
      @Parameter(description = "Internal list ID") @PathVariable("listId") Long listId) {
    userListService.deleteList(listId);
  }

  @PostMapping("/{listId}/albums/{albumId}")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Add an album to a list",
      description = "Adds an album to the list. Only the owner may modify the list.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Album added"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not the list's owner"),
    @ApiResponse(responseCode = "404", description = "List or album not found"),
    @ApiResponse(responseCode = "409", description = "Album already in list")
  })
  public UserListDetailResponse addAlbum(
      @Parameter(description = "Internal list ID") @PathVariable("listId") Long listId,
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId) {
    return userListService.addAlbum(listId, albumId);
  }

  @DeleteMapping("/{listId}/albums/{albumId}")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Remove an album from a list",
      description = "Removes an album from the list. Only the owner may modify the list.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Album removed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not the list's owner"),
    @ApiResponse(responseCode = "404", description = "List not found or album not in list")
  })
  public UserListDetailResponse removeAlbum(
      @Parameter(description = "Internal list ID") @PathVariable("listId") Long listId,
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId) {
    return userListService.removeAlbum(listId, albumId);
  }
}
