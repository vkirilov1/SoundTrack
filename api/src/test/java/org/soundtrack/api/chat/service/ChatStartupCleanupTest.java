package org.soundtrack.api.chat.service;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.domain.repository.ChatMessageRepository;
import org.soundtrack.domain.repository.ChatRoomRepository;

@ExtendWith(MockitoExtension.class)
class ChatStartupCleanupTest {

  @Mock private ChatRoomRepository chatRoomRepository;
  @Mock private ChatMessageRepository chatMessageRepository;

  private ChatStartupCleanup chatStartupCleanup;

  @BeforeEach
  void setUp() {
    chatStartupCleanup = new ChatStartupCleanup(chatRoomRepository, chatMessageRepository);
  }

  @Test
  void doesNothingWhenNoRoomsExist() {
    when(chatRoomRepository.count()).thenReturn(0L);

    chatStartupCleanup.run(null);

    verify(chatRoomRepository, never()).deleteAll();
  }

  @Test
  void wipesAllRoomsAndMessagesWhenAnyExist() {
    when(chatRoomRepository.count()).thenReturn(3L);

    chatStartupCleanup.run(null);

    verify(chatMessageRepository).deleteAllInBatch();
    verify(chatRoomRepository).deleteAll();
  }
}
