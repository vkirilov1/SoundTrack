package org.soundtrack.api.admin.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.admin.dto.AdminUserResponse;
import org.soundtrack.api.admin.dto.UpdateAlbumRequest;
import org.soundtrack.api.admin.dto.UpdateArtistRequest;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.album.mapper.AlbumMapper;
import org.soundtrack.api.artist.dto.ArtistResponse;
import org.soundtrack.api.artist.mapper.ArtistMapper;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.Review;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ArtistRepository;
import org.soundtrack.domain.repository.ReviewRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

  private final UserRepository userRepository;
  private final AlbumRepository albumRepository;
  private final ArtistRepository artistRepository;
  private final ReviewRepository reviewRepository;
  private final AlbumMapper albumMapper;
  private final ArtistMapper artistMapper;

  @Transactional(readOnly = true)
  public PagedResponse<AdminUserResponse> getUsers(int page, int size) {
    Page<User> userPage =
        userRepository.findAll(PageRequest.of(page, size, Sort.by("id").ascending()));

    List<AdminUserResponse> content =
        userPage.getContent().stream().map(this::toAdminUserResponse).toList();

    return new PagedResponse<>(
        content, page, size, userPage.getTotalElements(), userPage.getTotalPages());
  }

  @Transactional
  public void deleteUser(Long userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

    List<Review> reviews = reviewRepository.findByUserId(userId);
    for (Review review : reviews) {
      Album album = review.getAlbum();
      int count = album.getReviewsCount();
      if (count <= 1) {
        album.setRating(0);
        album.setReviewsCount(0);
      } else {
        double newRating = (album.getRating() * count - review.getRating()) / (count - 1);
        album.setRating(newRating);
        album.setReviewsCount(count - 1);
      }
    }
    reviewRepository.deleteAll(reviews);

    // 3. Delete the user. user_list rows cascade via ON DELETE CASCADE on user_list.owner_id.
    userRepository.delete(user);
  }

  @Transactional
  public AlbumResponse updateAlbum(Long albumId, UpdateAlbumRequest request) {
    Album album =
        albumRepository
            .findDetailedById(albumId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Album not found with id: " + albumId));

    album.setTitle(request.getTitle());
    if (request.getReleaseDate() != null) {
      album.setReleaseDate(request.getReleaseDate());
    }
    if (request.getCoverUrl() != null) {
      album.setCoverUrl(request.getCoverUrl());
    }

    return albumMapper.toResponse(album);
  }

  @Transactional
  public ArtistResponse updateArtist(Long artistId, UpdateArtistRequest request) {
    Artist artist =
        artistRepository
            .findDetailedById(artistId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Artist not found with id: " + artistId));

    artist.setArtistName(request.getArtistName());
    artist.setCountry(request.getCountry());
    artist.setArtistType(request.getArtistType());
    artist.setBiography(request.getBiography());

    return artistMapper.toResponse(artist);
  }

  @Transactional
  public void deleteReview(Long reviewId) {
    Review review =
        reviewRepository
            .findById(reviewId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Review not found with id: " + reviewId));

    Album album = review.getAlbum();
    int count = album.getReviewsCount();
    if (count <= 1) {
      album.setRating(0);
      album.setReviewsCount(0);
    } else {
      double newRating = (album.getRating() * count - review.getRating()) / (count - 1);
      album.setRating(newRating);
      album.setReviewsCount(count - 1);
    }

    reviewRepository.delete(review);
  }

  private AdminUserResponse toAdminUserResponse(User user) {
    return new AdminUserResponse(
        user.getId(), user.getUsername(), user.getEmail(), user.getRole(), user.getJoinDate());
  }
}
