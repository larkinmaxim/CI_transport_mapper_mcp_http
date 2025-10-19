/**
 * Transformation utility functions for XML data conversion
 */

import { InboundParameters, InboundParameter, OutboundParameters } from '../types/index.js';

/**
 * Combines separate date and time fields into ISO 8601 format
 * @param date - Date string in format "2025-10-20"
 * @param time - Time string in format "03:33"
 * @param timezone - Timezone string like "Europe/Berlin"
 * @returns ISO 8601 formatted string "2025-10-20T03:33:00Z"
 */
export function combineDateTimeToISO(date: string, time: string, timezone: string): string {
  return `${date}T${time}:00Z`;
}

/**
 * Extracts transport number from alphanumeric number
 * If no hyphen present, uses the entire value as-is
 * @param alphanumericNumber - Input string like "611441-812203" or "812203"
 * @returns Extracted number like "812203"
 */
export function extractTransportNumber(alphanumericNumber: string): string {
  // Input validation
  if (!alphanumericNumber || typeof alphanumericNumber !== 'string') {
    throw new Error(`Invalid transport number: Expected non-empty string, got: ${alphanumericNumber}`);
  }

  const trimmed = alphanumericNumber.trim();
  if (!trimmed) {
    throw new Error('Transport number cannot be empty or whitespace only');
  }

  // If no hyphen present, use the entire value as-is
  if (!trimmed.includes('-')) {
    return trimmed;
  }

  // If hyphen present, extract the part after the hyphen
  const parts = trimmed.split('-');
  const transportNumber = parts[parts.length - 1]; // Use last part (handles multiple hyphens)
  
  if (!transportNumber || transportNumber.trim() === '') {
    throw new Error(`Invalid transport number format: "${trimmed}". Last segment after hyphen is empty.`);
  }

  return transportNumber.trim();
}

/**
 * Extracts shipment number using the same logic as transport number
 * @param shipmentNumber - Input string like "611441-2216281" or "2216281"
 * @returns Extracted number like "2216281"
 */
export function extractShipmentNumber(shipmentNumber: string): string {
  return extractTransportNumber(shipmentNumber);
}

/**
 * Extracts parameter value from parameters array by qualifier
 * @param parameters - Array of parameter containers
 * @param qualifier - The qualifier to search for
 * @returns The parameter value or empty string if not found
 */
export function extractParameterValue(parameters: any[], qualifier: string): string {
  if (!parameters || !parameters[0] || !parameters[0].parameter) {
    return '';
  }
  
  const param = parameters[0].parameter.find((p: any) => 
    p.qualifier && p.qualifier[0] === qualifier
  );
  
  if (!param || !param.value || !param.value[0]) {
    return '';
  }
  
  return removeCDATA(param.value[0]).trim(); // Trim whitespace from CDATA
}

/**
 * Processes parameters from inbound format to outbound format
 * Filters based on visibility rules and removes CDATA sections
 * @param parameters - Inbound parameters container
 * @returns Outbound parameters structure
 */
export function processParameters(parameters: any): OutboundParameters {
  if (!parameters?.parameter) {
    return { parameter: [] };
  }
  
  return {
    parameter: parameters.parameter
      .filter((p: any) => shouldIncludeParameter(p))
      .map((p: any) => ({
        qualifier: p.qualifier[0],
        ...(p.value && p.value[0] && { value: removeCDATA(p.value[0]).trim() })
      }))
  };
}

/**
 * Removes CDATA wrapper from parameter values
 * @param value - The value which might be wrapped in CDATA
 * @returns Clean string value
 */
export function removeCDATA(value: any): string {
  if (typeof value === 'object' && value._) {
    return value._; // Extract from CDATA wrapper
  }
  return value?.toString() || '';
}

/**
 * Determines if a parameter should be included in the outbound XML
 * @param param - The parameter to check
 * @returns true if parameter should be included
 */
export function shouldIncludeParameter(param: any): boolean {
  // Include parameters that should be exported to carrier or are always visible
  return param.$.export2carrier === 'yes' || param.$.visibilityCarrier === 'always';
}

/**
 * Counts total items across all shipments (for metadata)
 * @param outboundData - The transformed outbound data
 * @returns Total number of items
 */
export function getTotalItemsCount(outboundData: any): number {
  if (!outboundData?.transport?.shipments?.shipment?.items?.item) {
    return 0;
  }
  
  const items = outboundData.transport.shipments.shipment.items.item;
  return Array.isArray(items) ? items.length : 1;
}
