/**
 * Type definitions for XML transformation
 */

// Inbound types
export * from './inbound';

// Outbound types  
export * from './outbound';

// MCP types
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}
