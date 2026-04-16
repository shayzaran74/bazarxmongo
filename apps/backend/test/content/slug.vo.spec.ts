// apps/backend/test/content/slug.vo.spec.ts

import { Slug } from '../../src/modules/content/domain/value-objects/slug.vo';

describe('Slug Value Object', () => {
  it('should create a valid slug from text', () => {
    const result = Slug.create('Hello World! This is a test.');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe('hello-world-this-is-a-test');
    }
  });

  it('should handle special characters', () => {
    const result = Slug.create('iPhone 15 Pro Max @ $999!!');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe('iphone-15-pro-max-999');
    }
  });

  it('should fail on empty string', () => {
    const result = Slug.create('');
    expect(result.success).toBe(false);
  });
});
