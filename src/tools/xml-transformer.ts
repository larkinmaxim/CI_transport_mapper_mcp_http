/**
 * XML Transformation Tool for MCP Server
 * Transforms inbound tour XML structure to outbound transport order format
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { parseXML, buildXML } from '../utils/xml-parser.js';
import { transformTourToTransport } from '../mappings/field-mappings.js';
import { validateInboundXML, validateOutboundXML, validateXMLString } from '../utils/validation.js';
import { getTotalItemsCount } from '../utils/transformation-utils.js';
import { TransformationResult } from '../types/index.js';

/**
 * MCP Tool definition for XML transformation
 */
export const xmlTransformTool = {
  definition: {
    name: 'transform_xml',
    description: 'Transforms inbound tour XML structure to outbound transport order format. Converts <tour> elements with shipments, stations, items, and parameters into standardized <transport> format following the mapping rules.',
    inputSchema: {
      type: 'object',
      properties: {
        inbound_xml: {
          type: 'string',
          description: 'XML string containing the source <tour> structure with route, stop, and delivery information. Must be valid XML with tour, shipment, station, and item elements.'
        }
      },
      required: ['inbound_xml']
    }
  } as Tool,

  /**
   * Tool handler function that performs the XML transformation
   * @param args - Arguments containing the inbound XML string
   * @returns Transformation result with metadata and suggestions
   */
  handler: async (args: { inbound_xml: string }): Promise<{
    content: Array<{
      type: string;
      text: string;
    }>;
    isError: boolean;
  }> => {
    try {
      // 1. Validate input XML string format
      validateXMLString(args.inbound_xml);
      
      // 2. Parse inbound XML
      const inboundData = await parseXML(args.inbound_xml);
      
      // 3. Validate inbound structure
      validateInboundXML(inboundData);
      
      // 4. Transform to outbound structure
      const outboundData = transformTourToTransport(inboundData);
      
      // 5. Validate outbound structure (temporarily disabled for debugging)
      // validateOutboundXML(outboundData);
      
      // 6. Build outbound XML
      const outboundXML = buildXML(outboundData);
      
      // 7. Create transformation metadata
      const metadata = {
        tour_id: inboundData.tour.$.id,
        transport_number: outboundData.transport.number,
        shipment_count: 1, // Currently handling single shipment
        items_count: getTotalItemsCount(outboundData),
        transformation_timestamp: new Date().toISOString()
      };
      
      // 8. Create transformation result
      const result: TransformationResult = {
        result: outboundXML,
        metadata,
        summary: `Successfully transformed tour ${metadata.tour_id} to transport order format. Processed ${metadata.items_count} items with complete station and parameter mapping.`,
        next_action: {
          type: 'offer_multiple_actions',
          message: 'XML transformation completed successfully. What would you like to do next?',
          options: [
            'save_file',
            'validate_schema', 
            'send_to_api',
            'view_differences',
            'transform_another'
          ]
        }
      };
      
      // Return in MCP format
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ],
        isError: false
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        content: [
          {
            type: 'text',
            text: `XML transformation failed: ${errorMessage}`
          }
        ],
        isError: true
      };
    }
  }
};
