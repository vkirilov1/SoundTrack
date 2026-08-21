package org.soundtrack.api.chat.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.soundtrack.domain.repository.ChatMessageRepository;
import org.soundtrack.domain.repository.ChatRoomRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Chats are live-only: a room exists only while its owner is connected. Any room still in the
 * database at startup is an orphan from a previous run (a restart kills every WebSocket without
 * firing disconnect handling), so wipe them all before serving traffic.
 */
@Component
@RequiredArgsConstructor
public class ChatStartupCleanup implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(ChatStartupCleanup.class);

  private final ChatRoomRepository chatRoomRepository;
  private final ChatMessageRepository chatMessageRepository;

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    long orphanedRooms = chatRoomRepository.count();
    if (orphanedRooms == 0) {
      return;
    }

    chatMessageRepository.deleteAllInBatch();
    chatRoomRepository.deleteAll();

    log.info("Cleaned up {} orphaned chat room(s) from a previous run", orphanedRooms);
  }
}
