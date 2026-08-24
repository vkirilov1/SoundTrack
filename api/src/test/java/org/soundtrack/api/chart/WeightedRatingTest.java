package org.soundtrack.api.chart;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import org.junit.jupiter.api.Test;

class WeightedRatingTest {

  @Test
  void weighsTowardGlobalMeanWhenUnreviewed() {
    double score = WeightedRating.score(0, 0, 3.0);

    assertThat(score).isEqualTo(3.0);
  }

  @Test
  void splitsEvenlyWhenReviewCountEqualsM() {
    double score =
        WeightedRating.score(5.0, (int) WeightedRating.MIN_REVIEWS_FOR_TRUSTED_RATING, 3.0);

    assertThat(score).isEqualTo(4.0);
  }

  @Test
  void leansTowardOwnRatingAsReviewCountGrows() {
    double lightlyReviewed = WeightedRating.score(5.0, 5, 3.0);
    double heavilyReviewed = WeightedRating.score(5.0, 100_000, 3.0);

    assertThat(lightlyReviewed).isCloseTo(3.0, within(0.5));
    assertThat(heavilyReviewed).isCloseTo(5.0, within(0.01));
  }
}
