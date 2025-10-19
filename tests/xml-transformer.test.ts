/**
 * Unit tests for XML transformation functionality
 */

import fs from 'fs';
import path from 'path';
import { xmlTransformTool } from '../src/tools/xml-transformer';
import { parseXML } from '../src/utils/xml-parser';
import { extractTransportNumber } from '../src/utils/transformation-utils';

describe('XML Transformer', () => {
  let inboundXML: string;
  let expectedOutboundXML: string;

  beforeAll(() => {
    // Load test fixtures
    inboundXML = fs.readFileSync(
      path.join(process.cwd(), 'tests', 'fixtures', 'inbound.xml'), 
      'utf8'
    );
    expectedOutboundXML = fs.readFileSync(
      path.join(process.cwd(), 'tests', 'fixtures', 'outbound.xml'), 
      'utf8'
    );
  });

  describe('Main Transformation', () => {
    it('should transform inbound XML to outbound format', async () => {
      const result = await xmlTransformTool.handler({ inbound_xml: inboundXML });
      
      expect(result.isError).toBe(false);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.result).toBeDefined();
      expect(parsedResult.metadata.tour_id).toBe('895851881');
      expect(parsedResult.metadata.transport_number).toBe('812203');
    });

    it('should handle date/time conversion correctly', async () => {
      const result = await xmlTransformTool.handler({ inbound_xml: inboundXML });
      const parsedResult = JSON.parse(result.content[0].text);
      
      // Check that the XML contains the expected date/time format
      expect(parsedResult.result).toContain('2025-10-20T03:33:00Z');
      expect(parsedResult.result).toContain('2025-10-20T03:43:00Z');
      expect(parsedResult.result).toContain('2025-10-20T04:03:00Z');
    });

    it('should handle invalid XML gracefully', async () => {
      const result = await xmlTransformTool.handler({ inbound_xml: 'invalid xml' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('XML transformation failed');
    });
  });

  describe('Transport Number Extraction Edge Cases', () => {
    it('should handle standard format with hyphen', () => {
      expect(extractTransportNumber('611441-812203')).toBe('812203');
      expect(extractTransportNumber('123456-789012')).toBe('789012');
    });

    it('should handle no hyphen by using entire value as-is', () => {
      expect(extractTransportNumber('812203')).toBe('812203');
      expect(extractTransportNumber('TRANSPORT123')).toBe('TRANSPORT123');
      expect(extractTransportNumber('999')).toBe('999');
    });

    it('should handle multiple hyphens by using last segment', () => {
      expect(extractTransportNumber('611441-812203-extra')).toBe('extra');
      expect(extractTransportNumber('a-b-c-d-e')).toBe('e');
      expect(extractTransportNumber('prefix-middle-final')).toBe('final');
    });

    it('should trim whitespace', () => {
      expect(extractTransportNumber('  611441-812203  ')).toBe('812203');
      expect(extractTransportNumber('611441-  812203  ')).toBe('812203');
      expect(extractTransportNumber('  812203  ')).toBe('812203'); // No hyphen case
    });

    it('should throw error for invalid inputs', () => {
      expect(() => extractTransportNumber('')).toThrow('Invalid transport number: Expected non-empty string');
      expect(() => extractTransportNumber('   ')).toThrow('Transport number cannot be empty');
      expect(() => extractTransportNumber(null as any)).toThrow('Invalid transport number: Expected non-empty string');
      expect(() => extractTransportNumber(undefined as any)).toThrow('Invalid transport number: Expected non-empty string');
      expect(() => extractTransportNumber(123 as any)).toThrow('Invalid transport number: Expected non-empty string');
    });

    it('should throw error for empty segments after hyphen', () => {
      expect(() => extractTransportNumber('611441-')).toThrow('Last segment after hyphen is empty');
      expect(() => extractTransportNumber('611441-   ')).toThrow('Last segment after hyphen is empty');
      expect(() => extractTransportNumber('-')).toThrow('Last segment after hyphen is empty');
    });

    it('should handle edge case with hyphen at start', () => {
      expect(extractTransportNumber('-812203')).toBe('812203');
    });
  });
});
