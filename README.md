# XML Transformer MCP Server

A **Model Context Protocol (MCP) HTTP server** that transforms inbound tour XML structures to outbound transport order format. Built with TypeScript/Node.js and supports both stdio and HTTP streamable transports.

## 🎯 Features

- ✅ **Single MCP Tool**: `transform_xml` for inbound→outbound XML conversion
- ✅ **Dual Transport Support**: Both stdio (for MCP clients) and HTTP (for web clients)
- ✅ **Complete Data Mapping**: Handles tours, shipments, stations, items, and multi-level parameters
- ✅ **Production Ready**: Full error handling, validation, and comprehensive testing
- ✅ **Type Safe**: Complete TypeScript implementation with strict validation

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

### Running the Server

```bash
# Run with stdio transport (default - for MCP clients)
npm start

# Run with HTTP streamable transport (for web clients)
npm run start:http

# Development mode with auto-reload
npm run dev        # stdio transport
npm run dev:http   # HTTP transport
```

### Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Clean build directory
npm run clean
```

## 📡 Usage Examples

### MCP Client (Stdio Transport)

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['dist/server.js']
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
```

### MCP Client (HTTP Transport)

```typescript
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const transport = new StreamableHTTPClientTransport({
  baseUrl: 'http://localhost:3000'
});

const client = new Client({}, { capabilities: {} });
await client.connect(transport);

// Use the same request format as above
```

### Environment Variables

```bash
# Transport type (stdio or http)
MCP_TRANSPORT=http

# Port for HTTP transport (default: 3000)
PORT=3000
```

## 🔧 XML Transformation

### Input Format (Inbound Tour)

```xml
<tour id="895851881">
    <alphanumeric_number>611441-812203</alphanumeric_number>
    <company_id>454692</company_id>
    <plant>DE Koerdel</plant>
    <vehicle_id>vehicleTanker</vehicle_id>
    <shipment id="556898153">
        <number>611441-2216281</number>
        <station type="loading">
            <company_name>Shell Int. Trading</company_name>
            <from_date>2025-10-20</from_date>
            <from_time>03:33</from_time>
            <!-- ... more station data ... -->
        </station>
        <items>
            <item>
                <pos_number>6766213</pos_number>
                <description>Super E10 S</description>
                <!-- ... more item data ... -->
            </item>
        </items>
        <!-- ... shipment parameters ... -->
    </shipment>
    <!-- ... tour parameters ... -->
</tour>
```

### Output Format (Outbound Transport)

```xml
<transport>
    <number>812203</number>
    <shipper_id>454692</shipper_id>
    <plant>DE Koerdel</plant>
    <vehicle_id>vehicleTanker</vehicle_id>
    <shipments>
        <shipment>
            <number>2216281</number>
            <station type="loading">
                <company_name>Shell Int. Trading</company_name>
                <date_time_period>
                    <start>2025-10-20T03:33:00Z</start>
                    <end>2025-10-20T03:43:00Z</end>
                    <timezone>Europe/Berlin</timezone>
                </date_time_period>
            </station>
            <items>
                <item>
                    <pos_number>6766213</pos_number>
                    <description>Super E10 S</description>
                    <!-- ... transformed item data ... -->
                </item>
            </items>
            <!-- ... shipment parameters ... -->
        </shipment>
    </shipments>
    <!-- ... transport parameters ... -->
</transport>
```

## 🎯 Key Transformations

| **Transformation** | **Rule** |
|-------------------|----------|
| **Root Element** | `<tour>` → `<transport>` |
| **Transport Number** | `"611441-812203"` → `"812203"` (or use as-is if no hyphen) |
| **Date/Time** | Separate fields → ISO 8601 (`2025-10-20T03:33:00Z`) |
| **Station Reference** | `loading_nr` → `loading_name` |
| **Multi-Level Parameters** | Process at transport, shipment, and item levels |
| **CDATA Cleanup** | Remove CDATA wrappers from parameter values |

## 📁 Project Structure

```
epm_KN/
├── src/
│   ├── server.ts                 # Main MCP server entry point
│   ├── tools/
│   │   └── xml-transformer.ts    # XML transformation logic
│   ├── types/
│   │   ├── inbound.ts            # TypeScript interfaces for inbound XML
│   │   ├── outbound.ts           # TypeScript interfaces for outbound XML
│   │   └── index.ts              # Type exports
│   ├── utils/
│   │   ├── xml-parser.ts         # XML parsing utilities
│   │   ├── transformation-utils.ts # Transformation helper functions
│   │   └── validation.ts         # Input/output validation
│   └── mappings/
│       └── field-mappings.ts     # Core transformation logic
├── tests/
│   ├── xml-transformer.test.ts   # Unit tests
│   └── fixtures/                 # Test XML files
├── Examples/
│   ├── inbound.xml               # Sample input
│   └── outbound.xml              # Sample output
└── Documentation/
    ├── MCP_Server_Implementation_Plan.md    # Detailed implementation guide
    └── XML_Path_Comparison_Table.md         # Mapping rules reference
```

## 🧪 Testing

The project includes comprehensive tests covering:

- ✅ **Main transformation logic** with real XML examples
- ✅ **Edge cases** for number extraction (with/without hyphens)
- ✅ **Error handling** for invalid XML inputs
- ✅ **Multi-level parameters** processing
- ✅ **Date/time conversion** validation

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- xml-transformer.test.ts
```

## 🔍 Validation

The server performs comprehensive validation:

- **Input XML Structure**: Validates required tour elements
- **Output XML Structure**: Ensures valid transport format
- **Parameter Processing**: Filters based on visibility rules
- **Data Types**: Type-safe transformations with Zod schemas

## 📊 Error Handling

- **Graceful Failures**: Clear error messages for debugging
- **Input Validation**: Catches malformed XML early
- **Type Safety**: Prevents runtime errors with TypeScript
- **Logging**: Comprehensive error reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass: `npm test`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

## 🔗 Related Documentation

- [MCP Server Implementation Plan](Documentation/MCP_Server_Implementation_Plan.md) - Complete technical specification
- [XML Path Comparison Table](Documentation/XML_Path_Comparison_Table.md) - Detailed mapping rules
- [Model Context Protocol](https://modelcontextprotocol.io/) - Official MCP documentation



