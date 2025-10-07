/**
 * ContentHash Value Object
 * Represents a cryptographic hash of content
 */

import crypto from 'crypto';

export class ContentHash {
  constructor(hash) {
    if (!ContentHash.isValid(hash)) {
      throw new Error('Invalid content hash format');
    }
    this.value = hash.toLowerCase();
  }

  /**
   * Validate hash format (SHA-256)
   */
  static isValid(hash) {
    if (typeof hash !== 'string') return false;
    if (hash.length !== 64) return false;
    if (!/^[a-fA-F0-9]{64}$/.test(hash)) return false;
    return true;
  }

  /**
   * Generate hash from content (string or buffer)
   */
  static fromContent(content) {
    let buffer;

    if (typeof content === 'string') {
      buffer = Buffer.from(content, 'utf8');
    } else if (Buffer.isBuffer(content)) {
      buffer = content;
    } else {
      throw new Error('Content must be string or buffer');
    }

    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return new ContentHash(hash);
  }

  /**
   * Generate hash from file buffer
   */
  static async fromFile(fileBuffer) {
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    return new ContentHash(hash);
  }

  /**
   * Generate hash from URL content (for web pages)
   */
  static async fromUrl(url) {
    const response = await fetch(url);
    const text = await response.text();
    return ContentHash.fromContent(text);
  }

  /**
   * Compare two hashes
   */
  equals(other) {
    if (!(other instanceof ContentHash)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Get truncated hash for display
   */
  getTruncated(length = 12) {
    return `${this.value.substring(0, length)}...${this.value.substring(this.value.length - 4)}`;
  }

  /**
   * Convert to string
   */
  toString() {
    return this.value;
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return this.value;
  }
}

export default ContentHash;
