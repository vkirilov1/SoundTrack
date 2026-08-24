package org.soundtrack.api.editrequest.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.soundtrack.api.editrequest.dto.EditRequestResponse;
import org.soundtrack.domain.model.EditRequest;
import org.soundtrack.domain.model.EditRequestStatus;
import org.soundtrack.domain.model.EditRequestTargetType;
import org.soundtrack.domain.model.User;

class EditRequestMapperTest {

  private final EditRequestMapper mapper = new EditRequestMapper();

  private EditRequest request() {
    EditRequest request = new EditRequest();
    request.setId(1L);
    request.setTargetType(EditRequestTargetType.ALBUM);
    request.setTargetId(9L);
    request.setProposedDescription("A better description.");
    request.setStatus(EditRequestStatus.PENDING);
    request.setRequestedBy(User.builder().id(2L).username("requester").build());
    request.setCreatedAt(LocalDateTime.of(2026, 1, 1, 0, 0));
    return request;
  }

  @Test
  void mapsPendingRequestWithNullReviewer() {
    EditRequest request = request();

    EditRequestResponse response = mapper.toResponse(request, "Album Title", "cover.jpg");

    assertThat(response.targetName()).isEqualTo("Album Title");
    assertThat(response.targetPhotoUrl()).isEqualTo("cover.jpg");
    assertThat(response.requestedByUsername()).isEqualTo("requester");
    assertThat(response.requestedByUserId()).isEqualTo(2L);
    assertThat(response.reviewedByUsername()).isNull();
    assertThat(response.reviewedAt()).isNull();
  }

  @Test
  void mapsReviewedRequestWithReviewerUsername() {
    EditRequest request = request();
    request.setStatus(EditRequestStatus.APPROVED);
    request.setReviewedBy(User.builder().id(3L).username("admin").build());
    request.setReviewedAt(LocalDateTime.of(2026, 1, 2, 0, 0));

    EditRequestResponse response = mapper.toResponse(request, "Album Title", "cover.jpg");

    assertThat(response.status()).isEqualTo(EditRequestStatus.APPROVED);
    assertThat(response.reviewedByUsername()).isEqualTo("admin");
    assertThat(response.reviewedAt()).isEqualTo(LocalDateTime.of(2026, 1, 2, 0, 0));
  }
}
