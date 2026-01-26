import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MessageBatcher, batchNotifications } from '../services/message-batcher.js';

describe('MessageBatcher', () => {
  let batcher;
  let sendMessageFn;
  let editMessageFn;
  let sentMessages;
  let editedMessages;

  beforeEach(() => {
    jest.useFakeTimers();
    sentMessages = [];
    editedMessages = [];

    sendMessageFn = jest.fn((text, priority) => {
      sentMessages.push({ text, priority });
      return Promise.resolve({ message_id: sentMessages.length });
    });

    editMessageFn = jest.fn((messageId, text) => {
      editedMessages.push({ messageId, text });
      return Promise.resolve({ message_id: messageId });
    });

    batcher = new MessageBatcher(5, sendMessageFn, editMessageFn); // 5 second window
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic batching', () => {
    it('should batch normal priority messages', async () => {
      await batcher.add('Message 1', 'normal');
      await batcher.add('Message 2', 'normal');

      expect(batcher.pending.length).toBe(2);
      expect(sentMessages.length).toBe(0);
    });

    it('should flush high priority messages immediately', async () => {
      await batcher.add('Urgent', 'high');

      // Queue should be empty after high-priority flush
      expect(batcher.pending.length).toBe(0);
      // Single messages are returned by flush() for the caller to handle,
      // not sent directly by the batcher
    });

    it('should flush messages after window expires', async () => {
      await batcher.add('Message 1', 'normal');
      await batcher.add('Message 2', 'normal');

      // Advance time past the window
      jest.advanceTimersByTime(6000);

      // Need to let promises settle
      await jest.runAllTimersAsync();

      expect(batcher.pending.length).toBe(0);
    });

    it('should combine messages with separator', async () => {
      await batcher.add('First', 'normal');
      await batcher.add('Second', 'normal');

      const result = await batcher.flush();

      // Result might be null if edit message succeeds
      if (result) {
        expect(result).toContain('First');
        expect(result).toContain('Second');
        expect(result).toContain('─────'); // Clean separator
      } else {
        // Check that edit was called with combined message
        expect(editedMessages.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Batch notifications', () => {
    it('should send batch header for multiple messages', async () => {
      await batcher.add('Message 1', 'normal');
      await batcher.add('Message 2', 'normal');

      await batcher.flush();

      // Should have sent batch header with count
      expect(sentMessages.some(m => m.text.includes('updates'))).toBe(true);
    });

    it('should edit batch header with combined content', async () => {
      await batcher.add('Message 1', 'normal');
      await batcher.add('Message 2', 'normal');

      await batcher.flush();

      // Should have edited the message with combined content
      expect(editedMessages.length).toBeGreaterThan(0);
      expect(editedMessages[0].text).toContain('Message 1');
      expect(editedMessages[0].text).toContain('Message 2');
    });

    it('should show correct message count in batch header', async () => {
      await batcher.add('Msg 1', 'normal');
      await batcher.add('Msg 2', 'normal');
      await batcher.add('Msg 3', 'normal');

      await batcher.flush();

      const batchMsg = sentMessages.find(m => m.text.includes('updates'));
      expect(batchMsg.text).toContain('3 updates');
    });

    it('should send single message directly without batch header', async () => {
      await batcher.add('Single message', 'normal');

      const result = await batcher.flush();

      // Single message should be returned directly, no batch header
      expect(result).toBe('Single message');
      // No batch header should have been sent for single message
      expect(sentMessages.filter(m => m.text.includes('updates')).length).toBe(0);
    });
  });

  describe('Timer management', () => {
    it('should set timer on first normal message', async () => {
      expect(batcher.timer).toBeNull();

      await batcher.add('Message 1', 'normal');

      expect(batcher.timer).not.toBeNull();
    });

    it('should not set multiple timers', async () => {
      await batcher.add('Message 1', 'normal');
      const firstTimer = batcher.timer;

      await batcher.add('Message 2', 'normal');

      expect(batcher.timer).toBe(firstTimer);
    });

    it('should clear timer after flush', async () => {
      await batcher.add('Message 1', 'normal');

      await batcher.flush();

      expect(batcher.timer).toBeNull();
    });

    it('should not trigger timer for high priority messages', async () => {
      await batcher.add('Urgent', 'high');

      expect(batcher.timer).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty flush', async () => {
      const result = await batcher.flush();
      expect(result).toBeNull();
    });

    it('should handle flush with only high priority messages', async () => {
      await batcher.add('High 1', 'high');
      await batcher.add('High 2', 'high');

      const result = await batcher.flush();
      expect(result).toBeNull(); // Already sent immediately
    });

    it('should handle edit message failure gracefully', async () => {
      editMessageFn.mockRejectedValueOnce(new Error('Edit failed'));

      await batcher.add('Message 1', 'normal');

      // Should not throw
      await expect(batcher.flush()).resolves.toBeDefined();
    });

    it('should handle send message failure gracefully', async () => {
      sendMessageFn.mockRejectedValueOnce(new Error('Send failed'));

      await batcher.add('Message 1', 'normal');

      // Should not throw
      await expect(batcher.flush()).resolves.toBeDefined();
    });
  });

  describe('Performance optimizations (O1)', () => {
    it('should accept custom maxQueueSize parameter', () => {
      const customBatcher = new MessageBatcher(5, sendMessageFn, editMessageFn, 50);
      expect(customBatcher.maxQueueSize).toBe(50);
    });

    it('should default to maxQueueSize of 100', () => {
      expect(batcher.maxQueueSize).toBe(100);
    });

    it('should auto-flush when queue reaches max capacity', async () => {
      const smallBatcher = new MessageBatcher(5, sendMessageFn, editMessageFn, 3);

      await smallBatcher.add('Message 1', 'normal');
      await smallBatcher.add('Message 2', 'normal');
      await smallBatcher.add('Message 3', 'normal');

      expect(smallBatcher.pending.length).toBe(3);

      // Adding 4th message should trigger auto-flush
      await smallBatcher.add('Message 4', 'normal');

      // After flush, should only have the 4th message
      expect(smallBatcher.pending.length).toBe(1);
      expect(sentMessages.length).toBeGreaterThan(0);
    });

    it('should clean up old messages beyond retention window', async () => {
      jest.useRealTimers(); // Use real timers for this test

      const fastBatcher = new MessageBatcher(
        1, // 1 second window
        sendMessageFn,
        editMessageFn,
        100
      );

      await fastBatcher.add('Old message', 'normal');

      // Wait longer than 2x the window (3 seconds for 1 second window)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Add new message which triggers cleanup
      await fastBatcher.add('New message', 'normal');

      // Should only have the new message
      expect(fastBatcher.pending.length).toBe(1);
      expect(fastBatcher.pending[0].message).toBe('New message');

      jest.useFakeTimers(); // Restore fake timers
    }, 15000); // Increase timeout for this test

    it('should not clean up recent messages', async () => {
      await batcher.add('Recent 1', 'normal');
      await batcher.add('Recent 2', 'normal');
      await batcher.add('Recent 3', 'normal');

      // All messages should still be present
      expect(batcher.pending.length).toBe(3);
    });

    it('should prevent unbounded memory growth', async () => {
      const smallBatcher = new MessageBatcher(5, sendMessageFn, editMessageFn, 10);

      // Try to add 20 messages
      for (let i = 0; i < 20; i++) {
        await smallBatcher.add(`Message ${i}`, 'normal');
      }

      // Queue should never exceed maxQueueSize + 1 (one more before flush)
      expect(smallBatcher.pending.length).toBeLessThanOrEqual(11);
    });
  });
});

describe('batchNotifications', () => {
  let batcher;
  let sendMessageFn;
  let editMessageFn;

  beforeEach(() => {
    jest.useFakeTimers();

    sendMessageFn = jest.fn(() =>
      Promise.resolve({ message_id: 1 })
    );

    editMessageFn = jest.fn(() =>
      Promise.resolve({ message_id: 1 })
    );

    batcher = new MessageBatcher(5, sendMessageFn, editMessageFn);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should add messages to batcher', async () => {
    const messages = [
      { text: 'Message 1', priority: 'normal' },
      { text: 'Message 2', priority: 'normal' },
    ];

    await batchNotifications(messages, batcher, sendMessageFn);

    expect(batcher.pending.length).toBe(2);
  });

  it('should flush immediately if any message is high priority', async () => {
    const messages = [
      { text: 'Normal', priority: 'normal' },
      { text: 'Urgent', priority: 'high' },
    ];

    await batchNotifications(messages, batcher, sendMessageFn);

    // Should have flushed
    expect(sendMessageFn).toHaveBeenCalled();
  });

  it('should return success with batch count', async () => {
    const messages = [
      { text: 'Msg 1' },
      { text: 'Msg 2' },
      { text: 'Msg 3' },
    ];

    const result = await batchNotifications(messages, batcher, sendMessageFn);

    expect(result.success).toBe(true);
    expect(result.batched).toBe(3);
  });

  it('should default priority to normal', async () => {
    const messages = [
      { text: 'No priority specified' },
    ];

    await batchNotifications(messages, batcher, sendMessageFn);

    expect(batcher.pending[0].priority).toBe('normal');
  });
});
