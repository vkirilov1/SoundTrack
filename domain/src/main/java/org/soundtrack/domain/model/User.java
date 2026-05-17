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

  @Column(nullable = false, unique = true)
  private String username;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
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

  @OneToMany(mappedBy = "user")
  private List<Review> reviews = new ArrayList<>();

  @OneToMany(mappedBy = "owner")
  private List<UserList> lists = new ArrayList<>();
}
