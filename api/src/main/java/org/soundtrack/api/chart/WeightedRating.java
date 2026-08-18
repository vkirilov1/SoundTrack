package org.soundtrack.api.chart;

/**
 * Shared constants and math for the Bayesian-weighted rating formula used by the Year/Genre chart
 * pages and the album page's chart-rank badge, so both stay consistent with each other. See <a
 * href="https://en.wikipedia.org/wiki/Bayesian_average">...</a>.
 */
public final class WeightedRating {

  /**
   * Minimum review count for an album's own rating to be trusted at face value (the "m" in {@code
   * (v/(v+m))*R + (m/(v+m))*C}). Below this, the score leans toward the site-wide mean instead, so
   * a handful of 5-star reviews can't outrank a widely-reviewed album with a slightly lower
   * average.
   */
  public static final double MIN_REVIEWS_FOR_TRUSTED_RATING = 50;

  /** Chart pages (and the album page's rank badge) only ever consider the top 1000 albums. */
  public static final int MAX_CHART_RESULTS = 1000;

  private WeightedRating() {}

  /**
   * @param rating an album's own average rating (R)
   * @param reviewsCount an album's own review count (v)
   * @param globalMean the site-wide mean rating across reviewed albums (C)
   * @return the Bayesian-weighted score
   */
  public static double score(double rating, int reviewsCount, double globalMean) {
    return (reviewsCount * rating + MIN_REVIEWS_FOR_TRUSTED_RATING * globalMean)
        / (reviewsCount + MIN_REVIEWS_FOR_TRUSTED_RATING);
  }
}
