package org.soundtrack.domain.repository;

import org.soundtrack.domain.model.UpcomingRelease;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UpcomingReleaseRepository extends JpaRepository<UpcomingRelease, Long> {

  Page<UpcomingRelease> findAllByOrderByReleaseDateAsc(Pageable pageable);
}
