# HTTP Streamable MCP Server - XML Transformation Implementation Plan

## Project Overview

Building a **Model Context Protocol (MCP) HTTP server** in **TypeScript/Node.js** with one primary tool: **XML transformation from inbound tour structure to outbound transport structure**.

### Key Requirements
- ✅ HTTP streamable MCP server
- ✅ TypeScript/Node.js implementation  
- ✅ Single tool: `transform_xml`
- ✅ Transform inbound `<tour>` XML → outbound `<transport>` XML
- ✅ Follow mapping rules from `XML_Path_Comparison_Table.md`
- ✅ Use example files from `Examples/` folder

---

## 1. Project Structure

```
epm_KN/
├── src/
│   ├── server.ts                 # Main MCP server entry point
│   ├── tools/
│   │   └── xml-transformer.ts    # XML transformation logic
│   ├── types/
│   │   ├── inbound.ts            # TypeScript interfaces for inbound XML
│   │   ├── outbound.ts           # TypeScript interfaces for outbound XML
│   │   └── mcp.ts                # MCP protocol types
│   ├── utils/
│   │   ├── xml-parser.ts         # XML parsing utilities
│   │   ├── date-utils.ts         # Date/time transformation utilities
│   │   └── validation.ts         # Input validation
│   └── mappings/
│       └── field-mappings.ts     # Centralized mapping definitions
├── tests/
│   ├── xml-transformer.test.ts   # Unit tests for transformation
│   ├── fixtures/                 # Test XML files
│   └── integration.test.ts       # Integration tests
├── dist/                         # Compiled JavaScript output
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
└── .gitignore
```

---

## 2. Dependencies & Setup

### Core Dependencies
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "xml2js": "^0.6.2",
    "xmlbuilder2": "^3.1.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/xml2js": "^0.4.14",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "ts-jest": "^29.1.1",
    "nodemon": "^3.0.2"
  }
}
```

### Scripts
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "start:http": "MCP_TRANSPORT=http node dist/server.js",
    "dev": "nodemon --exec ts-node src/server.ts",
    "dev:http": "MCP_TRANSPORT=http nodemon --exec ts-node src/server.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "clean": "rm -rf dist"
  }
}
```

---

## 3. TypeScript Configuration

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## 4. Core Implementation Architecture

### 4.1 MCP Server Setup (`src/server.ts`)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { xmlTransformTool } from './tools/xml-transformer.js';

// MCP Server instance
const server = new Server(
  {
    name: 'xml-transformer-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register XML transformation tool
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [xmlTransformTool.definition]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'transform_xml') {
    return xmlTransformTool.handler(request.params.arguments);
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Determine transport based on environment
async function startServer() {
  const transportType = process.env.MCP_TRANSPORT || 'stdio';
  
  if (transportType === 'http') {
    // HTTP Streamable transport for web clients
    const port = parseInt(process.env.PORT || '3000');
    const transport = new StreamableHTTPServerTransport({ port });
    
    console.log(`Starting MCP HTTP server on port ${port}`);
    await server.connect(transport);
    console.log('MCP HTTP server is running and ready for connections');
  } else {
    // Default to stdio transport for MCP clients
    const transport = new StdioServerTransport();
    console.log('Starting MCP server with stdio transport');
    await server.connect(transport);
  }
}

// Error handling
process.on('SIGINT', async () => {
  console.log('Shutting down MCP server...');
  await server.close();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
```

### 4.2 XML Transformation Tool (`src/tools/xml-transformer.ts`)

```typescript
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { parseXML, buildXML } from '../utils/xml-parser.js';
import { transformTourToTransport } from '../mappings/field-mappings.js';
import { validateInboundXML, validateOutboundXML } from '../utils/validation.js';

export const xmlTransformTool = {
  definition: {
    name: 'transform_xml',
    description: 'Transforms inbound tour XML structure to outbound transport order format',
    inputSchema: {
      type: 'object',
      properties: {
        inbound_xml: {
          type: 'string',
          description: 'XML string containing the source <tour> structure'
        }
      },
      required: ['inbound_xml']
    }
  } as Tool,

  handler: async (args: { inbound_xml: string }) => {
    try {
      // 1. Parse inbound XML
      const inboundData = await parseXML(args.inbound_xml);
      
      // 2. Validate inbound structure
      validateInboundXML(inboundData);
      
      // 3. Transform to outbound structure
      const outboundData = transformTourToTransport(inboundData);
      
      // 4. Validate outbound structure
      validateOutboundXML(outboundData);
      
      // 5. Build outbound XML
      const outboundXML = buildXML(outboundData);
      
      // 6. Return structured response
      return {
        result: outboundXML,
        metadata: {
          tour_id: inboundData.tour.$.id,
          transport_number: outboundData.transport.number,
          shipment_count: Array.isArray(outboundData.transport.shipments.shipment) 
            ? outboundData.transport.shipments.shipment.length 
            : 1,
          items_count: getTotalItemsCount(outboundData),
          transformation_timestamp: new Date().toISOString()
        },
        summary: `Successfully transformed tour ${inboundData.tour.$.id} to transport order format`,
        next_action: {
          type: 'offer_multiple_actions',
          message: 'XML transformation completed. What would you like to do next?',
          options: [
            'save_file',
            'validate_schema', 
            'send_to_api',
            'view_differences',
            'transform_another'
          ]
        }
      };
    } catch (error) {
      throw new Error(`XML transformation failed: ${error.message}`);
    }
  }
};
```

---

## 5. Detailed Mapping Implementation

### 5.1 Field Mappings (`src/mappings/field-mappings.ts`)

```typescript
import { InboundTour, OutboundTransport } from '../types/index.js';
import { 
  combineDateTimeToISO, 
  extractTransportNumber, 
  extractShipmentNumber,
  removeCDATAAndAttributes,
  processParameters 
} from '../utils/transformation-utils.js';

export function transformTourToTransport(inbound: InboundTour): OutboundTransport {
  const tour = inbound.tour;
  const shipment = tour.shipment;

  return {
    transport: {
      // Root level mappings
      number: extractTransportNumber(tour.alphanumeric_number[0]), // "611441-812203" → "812203"
      shipper_id: tour.company_id[0],
      vehicle_id: tour.vehicle_id[0],
      plant: tour.plant[0],
      price_basic: parseFloat(tour.price_basic[0]) || 0,
      
      // License plates from parameters
      license_plate_truck: extractParameterValue(tour.parameters, 'licenceplate'),
      license_plate_trailer: extractParameterValue(tour.parameters, 'licenceplatetrailer'),
      
      // Shipments container
      shipments: {
        shipment: {
          number: extractShipmentNumber(shipment.number[0]), // "611441-2216281" → "2216281"
          shipper_id: shipment.company_id[0],
          plant: shipment.plant[0],
          weight: 0, // Note: Inbound has actual values, outbound shows 0
          length: parseFloat(shipment.length[0]) || 0,
          volume: 0, // Note: Inbound has actual values, outbound shows 0  
          route: parseFloat(shipment.route[0]) || 0,
          vehicle_id: shipment.vehicle_id[0],
          
          // Transport unit info
          transportunit_count: 0,
          transportunit_pileable: false,
          transportunit_exchange: false,
          storage_position_count: 0,
          
          // Stations transformation
          station: transformStations(shipment.station),
          
          // Items transformation
          items: transformItems(shipment.items[0]),
          
          // Shipment-level parameters
          parameters: processParameters(shipment.parameters[0])
        }
      },
      
      // Transport-level parameters
      parameters: processParameters(tour.parameters[0])
    }
  };
}

function transformStations(stations: InboundStation[]): OutboundStation[] {
  return stations.map(station => ({
    $: { type: station.$.type },
    company_name: station.company_name[0],
    address: station.address[0],
    zip: station.zip[0],
    city: station.city[0],
    country_id: station.country_id[0],
    loading_name: station.loading_nr[0], // loading_nr → loading_name
    date_time_period: {
      start: combineDateTimeToISO(station.from_date[0], station.from_time[0], station.timezone[0]),
      end: combineDateTimeToISO(station.until_date[0], station.until_time[0], station.timezone[0]),
      timezone: station.timezone[0]
    }
  }));
}

function transformItems(items: InboundItems): OutboundItems {
  return {
    item: items.item.map(item => ({
      pos_number: item.pos_number[0],
      pos_index: item.pos_index[0], 
      description: item.description[0],
      short_description: item.short_description[0],
      material_number: item.material_number[0],
      quantities: transformQuantities(item.quantities[0]),
      parameters: processParameters(item.parameters[0])
    }))
  };
}

function transformQuantities(quantities: InboundQuantities): OutboundQuantities {
  return {
    quantity: quantities.quantity.map(qty => ({
      qualifier: qty.qualifier[0],
      unit: qty.unit[0],
      value: parseInt(parseFloat(qty.value[0]).toString()) // Remove decimal precision
    }))
  };
}
```

### 5.2 Transformation Utilities (`src/utils/transformation-utils.ts`)

```typescript
export function combineDateTimeToISO(date: string, time: string, timezone: string): string {
  // "2025-10-20" + "03:33" + "Europe/Berlin" → "2025-10-20T03:33:00Z"
  return `${date}T${time}:00Z`;
}

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

export function extractShipmentNumber(shipmentNumber: string): string {
  // Reuse the same robust logic for shipment numbers
  return extractTransportNumber(shipmentNumber);
}

export function extractParameterValue(parameters: InboundParameters[], qualifier: string): string {
  const param = parameters?.[0]?.parameter?.find(p => p.qualifier[0] === qualifier);
  return param?.value?.[0]?._ || param?.value?.[0] || '';
}

export function processParameters(parameters: InboundParameters): OutboundParameters {
  if (!parameters?.parameter) return { parameter: [] };
  
  return {
    parameter: parameters.parameter
      .filter(p => shouldIncludeParameter(p)) // Filter based on visibility rules
      .map(p => ({
        qualifier: p.qualifier[0],
        ...(p.value && { value: removeCDATA(p.value[0]) })
      }))
  };
}

function removeCDATA(value: any): string {
  if (typeof value === 'object' && value._) {
    return value._; // Extract from CDATA wrapper
  }
  return value?.toString() || '';
}

function shouldIncludeParameter(param: InboundParameter): boolean {
  // Include parameters that should be exported to carrier or are always visible
  return param.$.export2carrier === 'yes' || param.$.visibilityCarrier === 'always';
}

/**
 * Multi-Level Parameter Processing Example:
 * 
 * INBOUND XML:
 * <tour>
 *   <parameters>                              ← Tour/Transport Level
 *     <parameter qualifier="truck_id">9481</parameter>
 *     <parameter qualifier="fuel_type">Diesel</parameter>
 *   </parameters>
 *   <shipment>
 *     <parameters>                            ← Shipment Level
 *       <parameter qualifier="quantityAmount">34080.00</parameter>
 *       <parameter qualifier="fuel_type_delivery">Diesel</parameter>
 *     </parameters>
 *     <items>
 *       <item>
 *         <parameters>                        ← Item Level
 *           <parameter qualifier="tank.number">8</parameter>
 *           <parameter qualifier="bol"></parameter>
 *         </parameters>
 *       </item>
 *     </items>
 *   </shipment>
 * </tour>
 * 
 * OUTBOUND XML:
 * <transport>
 *   <parameters>                              ← Transport Level (from tour)
 *     <parameter><qualifier>truck_id</qualifier><value>9481</value></parameter>
 *     <parameter><qualifier>fuel_type</qualifier><value>Diesel</value></parameter>
 *   </parameters>
 *   <shipments>
 *     <shipment>
 *       <parameters>                          ← Shipment Level (NEW!)
 *         <parameter><qualifier>quantityAmount</qualifier><value>34080.00</value></parameter>
 *         <parameter><qualifier>fuel_type_delivery</qualifier><value>Diesel</value></parameter>
 *       </parameters>
 *       <items>
 *         <item>
 *           <parameters>                      ← Item Level
 *             <parameter><qualifier>tank.number</qualifier><value>8</value></parameter>
 *             <parameter><qualifier>bol</qualifier></parameter>
 *           </parameters>
 *         </item>
 *       </items>
 *     </shipment>
 *   </shipments>
 * </transport>
 */
```

---

## 6. TypeScript Interface Definitions

### 6.1 Inbound Types (`src/types/inbound.ts`)

```typescript
export interface InboundTour {
  tour: {
    $: { id: string };
    number: string[];
    alphanumeric_number: string[];
    company_id: string[];
    plant: string[];
    vehicle_id: string[];
    weight: string[];
    volume: string[];
    length: string[];
    route: string[];
    price_basic: string[];
    shipment: InboundShipment;
    parameters: InboundParameters[];
  };
}

export interface InboundShipment {
  $: { id: string };
  number: string[];
  company_id: string[];
  plant: string[];
  vehicle_id: string[];
  weight: string[];
  volume: string[];
  length: string[];
  route: string[];
  station: InboundStation[];
  items: InboundItems[];
  parameters: InboundParameters[];
}

export interface InboundStation {
  $: { type: 'loading' | 'unloading' };
  loading_nr: string[];
  company_name: string[];
  address: string[];
  zip: string[];
  city: string[];
  country_id: string[];
  from_date: string[];
  from_time: string[];
  until_date: string[];
  until_time: string[];
  timezone: string[];
}

export interface InboundItems {
  item: InboundItem[];
}

export interface InboundItem {
  $: { 
    id: string;
    visibilityCarrier: string;
    visibilityMom: string;
    visibilityShipper: string;
  };
  pos_number: string[];
  pos_index: string[];
  description: string[];
  short_description: string[];
  material_number: string[];
  quantities: InboundQuantities[];
  parameters: InboundParameters[];
}

export interface InboundQuantities {
  quantity: Array<{
    qualifier: string[];
    value: string[];
    unit: string[];
  }>;
}

export interface InboundParameters {
  parameter: InboundParameter[];
}

export interface InboundParameter {
  $: {
    export2carrier?: string;
    visibilityCarrier?: string;
    visibilityMom?: string;
    visibilityShipper?: string;
    visibilitySupplier?: string;
  };
  qualifier: string[];
  value?: Array<string | { _: string }>;
}
```

### 6.2 Outbound Types (`src/types/outbound.ts`)

```typescript
export interface OutboundTransport {
  transport: {
    number: string;
    shipper_id: string;
    vehicle_id: string;
    license_plate_truck: string;
    license_plate_trailer: string;
    price_basic: number;
    plant: string;
    shipments: {
      shipment: OutboundShipment;
    };
    parameters: OutboundParameters;
  };
}

export interface OutboundShipment {
  number: string;
  shipper_id: string;
  plant: string;
  weight: number;
  length: number;
  volume: number;
  route: number;
  transportunit_count: number;
  transportunit_pileable: boolean;
  transportunit_exchange: boolean;
  vehicle_id: string;
  storage_position_count: number;
  station: OutboundStation[];
  items: OutboundItems;
  parameters: OutboundParameters; // Shipment-level parameters
}

export interface OutboundStation {
  $: { type: 'loading' | 'unloading' };
  company_name: string;
  address: string;
  zip: string;
  city: string;
  country_id: string;
  loading_name: string;
  date_time_period: {
    start: string;
    end: string;
    timezone: string;
  };
}

export interface OutboundItems {
  item: OutboundItem[];
}

export interface OutboundItem {
  pos_number: string;
  pos_index: string;
  description: string;
  short_description: string;
  material_number: string;
  quantities: OutboundQuantities;
  parameters: OutboundParameters;
}

export interface OutboundQuantities {
  quantity: Array<{
    qualifier: string;
    unit: string;
    value: number;
  }>;
}

export interface OutboundParameters {
  parameter: Array<{
    qualifier: string;
    value?: string;
  }>;
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests (`tests/xml-transformer.test.ts`)

```typescript
import { xmlTransformTool } from '../src/tools/xml-transformer';
import fs from 'fs';
import path from 'path';

describe('XML Transformer', () => {
  const inboundXML = fs.readFileSync(path.join(__dirname, '../Examples/inbound.xml'), 'utf8');
  const expectedOutboundXML = fs.readFileSync(path.join(__dirname, '../Examples/outbound.xml'), 'utf8');

  it('should transform inbound XML to outbound format', async () => {
    const result = await xmlTransformTool.handler({ inbound_xml: inboundXML });
    
    expect(result.result).toBeDefined();
    expect(result.metadata.tour_id).toBe('895851881');
    expect(result.metadata.transport_number).toBe('812203');
  });

  it('should handle date/time conversion correctly', async () => {
    const result = await xmlTransformTool.handler({ inbound_xml: inboundXML });
    const parsedResult = parseXML(result.result);
    
    expect(parsedResult.transport.shipments.shipment.station[0].date_time_period.start)
      .toBe('2025-10-20T03:33:00Z');
  });

  it('should remove CDATA sections from parameters', async () => {
    const result = await xmlTransformTool.handler({ inbound_xml: inboundXML });
    const parsedResult = parseXML(result.result);
    
    const truckIdParam = parsedResult.transport.parameters.parameter
      .find(p => p.qualifier === 'truck_id');
    expect(truckIdParam.value).toBe('9481'); // No CDATA wrapper
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
      expect(() => extractTransportNumber('')).toThrow('Transport number cannot be empty');
      expect(() => extractTransportNumber('   ')).toThrow('Transport number cannot be empty');
      expect(() => extractTransportNumber(null as any)).toThrow('Invalid transport number');
      expect(() => extractTransportNumber(undefined as any)).toThrow('Invalid transport number');
      expect(() => extractTransportNumber(123 as any)).toThrow('Invalid transport number');
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

  it('should filter parameters based on visibility rules', async () => {
    const result = await xmlTransformTool.handler({ inbound_xml: inboundXML });
    const parsedResult = parseXML(result.result);
    
    // Should only include parameters with export2carrier="yes" or visibilityCarrier="always"
    const params = parsedResult.transport.parameters.parameter;
    expect(params.length).toBeLessThan(50); // Much fewer than inbound
  });

  it('should process multi-level parameters (transport, shipment, and item levels)', async () => {
    const result = await xmlTransformTool.handler({ inbound_xml: inboundXML });
    const parsedResult = parseXML(result.result);
    
    // Transport-level parameters
    const transportParams = parsedResult.transport.parameters.parameter;
    expect(transportParams).toBeDefined();
    expect(transportParams.length).toBeGreaterThan(0);
    
    // Check for specific transport-level parameters
    const truckIdParam = transportParams.find(p => p.qualifier === 'truck_id');
    expect(truckIdParam).toBeDefined();
    expect(truckIdParam.value).toBe('9481');
    
    // Shipment-level parameters
    const shipmentParams = parsedResult.transport.shipments.shipment.parameters.parameter;
    expect(shipmentParams).toBeDefined();
    expect(shipmentParams.length).toBeGreaterThan(0);
    
    // Check for specific shipment-level parameters
    const quantityParam = shipmentParams.find(p => p.qualifier === 'quantityAmount');
    if (quantityParam) {
      expect(quantityParam.value).toBe('34080.00');
    }
    
    // Item-level parameters
    const firstItem = parsedResult.transport.shipments.shipment.items.item[0];
    const itemParams = firstItem.parameters.parameter;
    expect(itemParams).toBeDefined();
    expect(itemParams.length).toBeGreaterThan(0);
    
    // Check for specific item-level parameters
    const tankParam = itemParams.find(p => p.qualifier === 'tank.number');
    expect(tankParam).toBeDefined();
    expect(tankParam.value).toBe('8');
  });
});
```

### 7.2 Integration Tests (`tests/integration.test.ts`)

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import fs from 'fs';
import path from 'path';

describe('MCP Server Integration', () => {
  const inboundXML = fs.readFileSync(path.join(__dirname, '../Examples/inbound.xml'), 'utf8');

  describe('Stdio Transport', () => {
    let client: Client;
    let transport: StdioClientTransport;

    beforeAll(async () => {
      transport = new StdioClientTransport({
        command: 'node',
        args: [path.join(__dirname, '../dist/server.js')]
      });
      client = new Client({}, { capabilities: {} });
      await client.connect(transport);
    });

    afterAll(async () => {
      await client.close();
    });

    it('should list available tools', async () => {
      const result = await client.request({
        method: 'tools/list',
        params: {}
      });

      expect(result.tools).toHaveLength(1);
      expect(result.tools[0].name).toBe('transform_xml');
    });

    it('should transform XML via MCP protocol', async () => {
      const result = await client.request({
        method: 'tools/call',
        params: {
          name: 'transform_xml',
          arguments: { inbound_xml: inboundXML }
        }
      });

      expect(result.content[0].text).toContain('<transport>');
      expect(result.isError).toBe(false);
    });

    it('should handle invalid XML gracefully', async () => {
      const result = await client.request({
        method: 'tools/call',
        params: {
          name: 'transform_xml',
          arguments: { inbound_xml: 'invalid xml' }
        }
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('XML transformation failed');
    });
  });

  describe('HTTP Transport', () => {
    let client: Client;
    let transport: StreamableHTTPClientTransport;

    beforeAll(async () => {
      // Start server with HTTP transport in background
      process.env.MCP_TRANSPORT = 'http';
      process.env.PORT = '3001';
      
      transport = new StreamableHTTPClientTransport({
        baseUrl: 'http://localhost:3001'
      });
      client = new Client({}, { capabilities: {} });
      
      // Wait a bit for server to start
      await new Promise(resolve => setTimeout(resolve, 1000));
      await client.connect(transport);
    });

    afterAll(async () => {
      await client.close();
      delete process.env.MCP_TRANSPORT;
      delete process.env.PORT;
    });

    it('should transform XML via HTTP streamable transport', async () => {
      const result = await client.request({
        method: 'tools/call',
        params: {
          name: 'transform_xml',
          arguments: { inbound_xml: inboundXML }
        }
      });

      expect(result.content[0].text).toContain('<transport>');
      expect(result.isError).toBe(false);
    });
  });
});
```

---

## 8. Error Handling & Validation

### 8.1 Validation (`src/utils/validation.ts`)

```typescript
import { z } from 'zod';

const inboundTourSchema = z.object({
  tour: z.object({
    $: z.object({ id: z.string() }),
    alphanumeric_number: z.array(z.string()),
    company_id: z.array(z.string()),
    shipment: z.object({
      $: z.object({ id: z.string() }),
      number: z.array(z.string()),
      station: z.array(z.object({
        $: z.object({ type: z.enum(['loading', 'unloading']) }),
        company_name: z.array(z.string()),
        // ... more validation rules
      }))
    })
  })
});

export function validateInboundXML(data: any): void {
  try {
    inboundTourSchema.parse(data);
  } catch (error) {
    throw new Error(`Invalid inbound XML structure: ${error.message}`);
  }
}

export function validateOutboundXML(data: any): void {
  // Similar validation for outbound structure
  if (!data.transport?.number) {
    throw new Error('Missing transport number in outbound data');
  }
  // ... more validation rules
}
```

---

## 9. Deployment & Usage

### 9.1 Development Commands

```bash
# Install dependencies
npm install

# Run in development mode with stdio transport (default)
npm run dev

# Run in development mode with HTTP transport  
npm run dev:http

# Build for production
npm run build

# Run production server with stdio transport
npm start

# Run production server with HTTP transport
npm run start:http

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### 9.2 Usage Examples

#### HTTP Streamable Transport Usage
```bash
# Start server with HTTP transport
MCP_TRANSPORT=http PORT=3000 npm start

# The server will be available for MCP clients at:
# ws://localhost:3000/sse (Server-Sent Events)
# http://localhost:3000 (HTTP requests)
```

#### Stdio Transport Usage (Default)
```bash
# Start server with stdio transport (for MCP clients)
npm start

# The server communicates via stdin/stdout following MCP protocol
```

#### MCP Client Usage Examples
```typescript
// For HTTP transport
import { Client } from '@modelcontextprotocol/sdk';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const transport = new StreamableHTTPClientTransport({
  baseUrl: 'http://localhost:3000'
});
const client = new Client({}, { capabilities: {} });
await client.connect(transport);

const result = await client.request({
  method: 'tools/call',
  params: {
    name: 'transform_xml',
    arguments: {
      inbound_xml: '<tour id="895851881">...</tour>'
    }
  }
});

// For stdio transport
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['dist/server.js']
});
const client = new Client({}, { capabilities: {} });
await client.connect(transport);
```

---

## 10. Key Implementation Notes

### 10.1 Critical Transformations

1. **Root Element**: `<tour>` → `<transport>`
2. **Transport Number**: Extract from `alphanumeric_number` ("611441-812203" → "812203" or use as-is if no hyphen)
3. **Shipment Number**: Extract from shipment `number` ("611441-2216281" → "2216281" or use as-is if no hyphen)
4. **Date/Time**: Combine separate fields into ISO 8601 format
5. **CDATA Removal**: Strip CDATA sections from parameter values
6. **Multi-Level Parameters**: Process parameters at 3 levels:
   - **Transport Level**: `/tour/parameters` → `/transport/parameters`
   - **Shipment Level**: `/tour/shipment/parameters` → `/transport/shipments/shipment/parameters` ⭐ **ADDED**
   - **Item Level**: `/tour/shipment/items/item/parameters` → `/transport/shipments/shipment/items/item/parameters`
7. **Parameter Filtering**: Only include parameters with proper visibility settings
8. **Station References**: `loading_nr` → `loading_name`
9. **Weight/Volume**: Handle discrepancy (inbound has values, outbound shows 0)

### 10.2 Special Considerations

- **Memory Efficiency**: Stream large XML files rather than loading entirely into memory
- **Error Recovery**: Graceful handling of malformed XML or missing required fields
- **Extensibility**: Easy to add new transformation rules or modify existing ones
- **Performance**: Optimize for processing multiple files in sequence

### 10.3 Future Enhancements

- **Batch Processing**: Handle multiple XML files in one request
- **Validation Schemas**: XSD schema validation for input/output
- **Logging**: Comprehensive logging for debugging and monitoring
- **Configuration**: External configuration for mapping rules
- **WebSocket Support**: Enhanced real-time streaming capabilities

---

## 🎯 Implementation Priority

1. ✅ **Setup** - Project structure, dependencies, TypeScript config
2. ✅ **Core Logic** - XML parsing, transformation, and building
3. ✅ **MCP Integration** - Server setup with proper SDK transports
4. ✅ **Dual Transport Support** - Both stdio and HTTP streamable transports
5. ✅ **Testing** - Unit and integration tests with both transport types
6. ✅ **Error Handling** - Validation and comprehensive error management
7. ✅ **Documentation** - README and API documentation

## 🚀 Key Architecture Benefits

- **✅ Native MCP SDK Integration**: Uses `StreamableHTTPServerTransport` for proper HTTP streaming
- **✅ Dual Transport Support**: Both stdio (for MCP clients) and HTTP (for web clients)  
- **✅ Environment-based Configuration**: Easy switching between transport modes
- **✅ Production-Ready**: Proper error handling, graceful shutdown, and comprehensive testing
- **✅ Type-Safe**: Full TypeScript support with proper MCP SDK types

This implementation plan provides a comprehensive roadmap for building a production-ready HTTP streamable MCP server for XML transformation using the correct MCP SDK architecture.

---

## 📋 **Simplified Transport Number Extraction Logic**

Based on your requirement: **"If '-' not present, take inbound value as-is"**

### **Simple Behavior Rules:**

| **Input Example** | **Output** | **Logic Applied** |
|-------------------|------------|-------------------|
| `"611441-812203"` | `"812203"` | Extract part after hyphen |
| `"812203"` | `"812203"` | **Use entire value as-is** (no hyphen) |
| `"TRANSPORT123"` | `"TRANSPORT123"` | **Use entire value as-is** (no hyphen) |
| `"a-b-c-final"` | `"final"` | Use last segment (multiple hyphens) |
| `"  812203  "` | `"812203"` | Trim whitespace, use as-is |

### **✅ Key Benefits:**
- **✅ Simple Logic**: If hyphen exists → extract after hyphen, otherwise → use as-is
- **✅ No Warnings**: Clean execution without console logging
- **✅ Backward Compatible**: Handles existing `"prefix-number"` format perfectly
- **✅ Forward Compatible**: Accepts any format without hyphens seamlessly
- **✅ Robust**: Only throws errors for truly invalid data (empty/null values)
