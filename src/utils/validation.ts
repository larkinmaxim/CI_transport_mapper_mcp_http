/**
 * Input and output validation utilities
 */

import { z } from 'zod';

// Simplified inbound tour validation schema for xml2js output
const inboundTourSchema = z.object({
  tour: z.object({
    $: z.object({ 
      id: z.string().min(1, 'Tour ID is required') 
    }),
    alphanumeric_number: z.array(z.string().min(1, 'Alphanumeric number is required')),
    company_id: z.array(z.string().min(1, 'Company ID is required')),
    plant: z.array(z.string().min(1, 'Plant is required')),
    vehicle_id: z.array(z.string().min(1, 'Vehicle ID is required')),
    shipment: z.any() // Simplified - xml2js creates complex nested structures
  })
});

// Simplified outbound transport validation schema
const outboundTransportSchema = z.object({
  transport: z.object({
    number: z.string().min(1, 'Transport number is required'),
    shipper_id: z.string().min(1, 'Shipper ID is required'),
    vehicle_id: z.string().min(1, 'Vehicle ID is required'),
    plant: z.string().min(1, 'Plant is required'),
    price_basic: z.number().min(0, 'Price basic must be non-negative'),
    shipments: z.any() // Simplified for now
  })
});

/**
 * Validates inbound XML data structure
 * @param data - Parsed XML data to validate
 * @throws Error if validation fails
 */
export function validateInboundXML(data: any): void {
  try {
    inboundTourSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join('; ');
      throw new Error(`Invalid inbound XML structure: ${issues}`);
    }
    throw new Error(`Invalid inbound XML structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates outbound XML data structure
 * @param data - Transformed data to validate
 * @throws Error if validation fails
 */
export function validateOutboundXML(data: any): void {
  try {
    outboundTransportSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join('; ');
      throw new Error(`Invalid outbound XML structure: ${issues}`);
    }
    throw new Error(`Invalid outbound XML structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates XML string format
 * @param xmlString - XML string to validate
 * @throws Error if XML is malformed
 */
export function validateXMLString(xmlString: string): void {
  if (!xmlString || typeof xmlString !== 'string') {
    throw new Error('XML string is required and must be a string');
  }

  const trimmed = xmlString.trim();
  if (!trimmed) {
    throw new Error('XML string cannot be empty');
  }

  // Basic XML structure validation
  if (!trimmed.startsWith('<') || !trimmed.endsWith('>')) {
    throw new Error('Invalid XML format: must start with < and end with >');
  }

  // Check for basic XML structure
  if (!trimmed.includes('<tour') && !trimmed.includes('<transport')) {
    throw new Error('XML must contain either <tour> or <transport> root element');
  }
}
