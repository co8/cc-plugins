import { describe, it, expect } from '@jest/globals';

// Copy of validation functions for testing
function validateSendMessage(args) {
  if (!args.text || typeof args.text !== 'string') {
    throw new Error('Invalid input: "text" must be a non-empty string');
  }

  if (args.priority && !['low', 'normal', 'high'].includes(args.priority)) {
    throw new Error('Invalid input: "priority" must be one of: low, normal, high');
  }
}

function validateApprovalRequest(args) {
  if (!args.question || typeof args.question !== 'string') {
    throw new Error('Invalid input: "question" must be a non-empty string');
  }

  if (!Array.isArray(args.options) || args.options.length === 0) {
    throw new Error('Invalid input: "options" must be a non-empty array');
  }

  for (let i = 0; i < args.options.length; i++) {
    const opt = args.options[i];
    if (!opt || typeof opt !== 'object') {
      throw new Error(`Invalid input: option at index ${i} must be an object`);
    }
    if (!opt.label || typeof opt.label !== 'string') {
      throw new Error(`Invalid input: option at index ${i} must have a "label" string`);
    }
    if (!opt.description || typeof opt.description !== 'string') {
      throw new Error(`Invalid input: option at index ${i} must have a "description" string`);
    }
  }

  if (args.header && typeof args.header !== 'string') {
    throw new Error('Invalid input: "header" must be a string if provided');
  }
}

describe('Input Validation Tests', () => {
  describe('sendMessage validation', () => {
    it('should accept valid message', () => {
      expect(() => {
        validateSendMessage({ text: 'Hello world', priority: 'normal' });
      }).not.toThrow();
    });

    it('should reject empty text', () => {
      expect(() => {
        validateSendMessage({ text: '', priority: 'normal' });
      }).toThrow('text');
    });

    it('should reject missing text', () => {
      expect(() => {
        validateSendMessage({ priority: 'normal' });
      }).toThrow('text');
    });

    it('should reject invalid priority', () => {
      expect(() => {
        validateSendMessage({ text: 'Test', priority: 'urgent' });
      }).toThrow('priority');
    });

    it('should accept valid priorities', () => {
      ['low', 'normal', 'high'].forEach(priority => {
        expect(() => {
          validateSendMessage({ text: 'Test', priority });
        }).not.toThrow();
      });
    });
  });

  describe('sendApprovalRequest validation', () => {
    it('should accept valid approval request', () => {
      expect(() => {
        validateApprovalRequest({
          question: 'Choose one',
          options: [
            { label: 'Option 1', description: 'First' },
            { label: 'Option 2', description: 'Second' }
          ]
        });
      }).not.toThrow();
    });

    it('should reject empty question', () => {
      expect(() => {
        validateApprovalRequest({
          question: '',
          options: [{ label: 'A', description: 'B' }]
        });
      }).toThrow('question');
    });

    it('should reject empty options array', () => {
      expect(() => {
        validateApprovalRequest({
          question: 'Test',
          options: []
        });
      }).toThrow('options');
    });

    it('should reject option without label', () => {
      expect(() => {
        validateApprovalRequest({
          question: 'Test',
          options: [{ description: 'Test' }]
        });
      }).toThrow('label');
    });

    it('should reject option without description', () => {
      expect(() => {
        validateApprovalRequest({
          question: 'Test',
          options: [{ label: 'Test' }]
        });
      }).toThrow('description');
    });

    it('should accept optional header', () => {
      expect(() => {
        validateApprovalRequest({
          question: 'Test',
          options: [{ label: 'A', description: 'B' }],
          header: 'Choose'
        });
      }).not.toThrow();
    });
  });
});
