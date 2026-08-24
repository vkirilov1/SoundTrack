package org.soundtrack.api.review.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.soundtrack.api.review.dto.ReviewResponse;
import org.soundtrack.api.review.dto.UserReviewResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Review;
import org.soundtrack.domain.model.User;

class ReviewMapperTest {

  private final ReviewMapper mapper = new ReviewMapper();

  private Review review() {
    User user = User.builder().id(5L).username("vkirilov").profilePicture("pic.jpg").build();
    Album album = new Album();
    album.setId(9L);
    album.setTitle("In Rainbows");
    album.setCoverUrl("inrainbows.jpg");

    return Review.builder()
        .id(1L)
        .rating(4.5)
        .title("Excellent")
        .comment("Loved it.")
        .user(user)
        .album(album)
        .createdAt(LocalDateTime.of(2026, 1, 1, 12, 0))
        .build();
  }

  @Test
  void defaultsFollowedAuthorToFalse() {
    ReviewResponse response = mapper.toResponse(review());

    assertThat(response.isFollowedAuthor()).isFalse();
    assertThat(response.getUsername()).isEqualTo("vkirilov");
    assertThat(response.getUserId()).isEqualTo(5L);
    assertThat(response.getProfilePictureUrl()).isEqualTo("pic.jpg");
  }

  @Test
  void passesThroughFollowedAuthorFlag() {
    ReviewResponse response = mapper.toResponse(review(), true);

    assertThat(response.isFollowedAuthor()).isTrue();
  }

  @Test
  void mapsUserReviewResponseWithAlbumDetails() {
    UserReviewResponse response = mapper.toUserReviewResponse(review());

    assertThat(response.getAlbumId()).isEqualTo(9L);
    assertThat(response.getAlbumTitle()).isEqualTo("In Rainbows");
    assertThat(response.getAlbumCoverUrl()).isEqualTo("inrainbows.jpg");
    assertThat(response.getRating()).isEqualTo(4.5);
  }
}
