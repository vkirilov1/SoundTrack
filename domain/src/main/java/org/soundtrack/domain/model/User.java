package org.soundtrack.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Table(name = "user_account")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "username", nullable = false, unique = true)
  private String username;

  @Column(name = "email", nullable = false, unique = true)
  private String email;

  @Column(name = "password", nullable = false)
  private String password;

  @Column(name = "bio")
  private String bio;

  @Column(name = "profile_pic")
  private String profilePicture;

  @Column(name = "user_role")
  @Enumerated(EnumType.STRING)
  private UserRole role;

  @Column(name = "join_date")
  private LocalDateTime joinDate;

  @Column(name = "chat_access_revoked", nullable = false)
  @Builder.Default
  private boolean chatAccessRevoked = false;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @OneToMany(mappedBy = "user")
  private List<Review> reviews = new ArrayList<>();

  @OneToMany(mappedBy = "owner")
  private List<UserList> lists = new ArrayList<>();
}
