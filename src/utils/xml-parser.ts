/**
 * XML parsing and building utilities
 */

import { parseString, Builder } from 'xml2js';
import { promisify } from 'util';

// Convert parseString to Promise-based function
const parseXMLString = promisify(parseString);

/**
 * Parses XML string into JavaScript object
 * @param xmlString - The XML string to parse
 * @returns Parsed JavaScript object
 */
export async function parseXML(xmlString: string): Promise<any> {
  try {
    const result = await parseXMLString(xmlString);
    return result;
  } catch (error) {
    throw new Error(`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Builds XML string from JavaScript object
 * @param data - The JavaScript object to convert to XML
 * @returns XML string
 */
export function buildXML(data: any): string {
  try {
    const builder = new Builder({
      rootName: 'transport',
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { 
        pretty: true, 
        indent: '    ', 
        newline: '\n' 
      },
      headless: false
    });
    
    return builder.buildObject(data.transport);
  } catch (error) {
    throw new Error(`Failed to build XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
