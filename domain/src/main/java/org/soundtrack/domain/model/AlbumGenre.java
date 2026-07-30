package org.soundtrack.domain.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Join entity linking an {@link Album} to a {@link Genre}, carrying the relevance weight
 * (MusicBrainz tag vote count) for that specific pairing.
 */
@Entity
@Table(
    name = "album_genre",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uq_album_genre",
            columnNames = {"album_id", "genre_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlbumGenre {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "album_id", nullable = false)
  private Album album;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "genre_id", nullable = false)
  private Genre genre;

  @Column(name = "weight", nullable = false)
  private int weight;
}
