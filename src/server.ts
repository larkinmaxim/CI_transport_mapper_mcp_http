/**
 * MCP Server for XML Transformation
 * Supports both stdio and HTTP streamable transports
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { xmlTransformTool } from './tools/xml-transformer.js';

/**
 * MCP Server instance with XML transformation capabilities
 */
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

/**
 * Register the XML transformation tool
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [xmlTransformTool.definition]
  };
});

/**
 * Handle tool execution requests
 */
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'transform_xml') {
    if (!args || typeof args !== 'object' || !('inbound_xml' in args)) {
      throw new Error('Missing required argument: inbound_xml');
    }
    return xmlTransformTool.handler(args as { inbound_xml: string });
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

/**
 * Start HTTP server with StreamableHTTPServerTransport
 */
async function startHttpServer() {
  const port = parseInt(process.env.PORT || '3100');
  const app = express();
  app.use(express.json());

  // Handle MCP requests
  app.post('/mcp', async (req, res) => {
    try {
      // Create a new transport for each request (stateless mode)
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless mode
        enableJsonResponse: true
      });

      res.on('close', () => {
        transport.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error'
          },
          id: null
        });
      }
    }
  });

  // Health check endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'XML Transformer MCP Server',
      version: '1.0.0',
      status: 'running',
      transport: 'HTTP',
      tools: ['transform_xml'],
      endpoint: '/mcp'
    });
  });

  app.listen(port, () => {
    console.error(`🚀 Starting MCP server with HTTP transport on port ${port}`);
    console.error(`✅ MCP server connected via HTTP on http://localhost:${port}`);
    console.error('🛠️  Available endpoints:');
    console.error('   - GET  /     : Server status and info');
    console.error('   - POST /mcp  : MCP requests endpoint');
    console.error('🛠️  Available tools:');
    console.error('   - transform_xml: Converts inbound tour XML to outbound transport format');
  });
}

/**
 * Start the server with appropriate transport (stdio or HTTP)
 */
async function startServer() {
  try {
    const transportType = process.env.MCP_TRANSPORT || 'stdio';
    
    if (transportType === 'http') {
      await startHttpServer();
    } else {
      // Use stdio transport for MCP clients
      const transport = new StdioServerTransport();
      console.error('🚀 Starting MCP server with stdio transport');
      await server.connect(transport);
      console.error('✅ MCP server connected via stdio');
      
      console.error('🛠️  Available tools:');
      console.error('   - transform_xml: Converts inbound tour XML to outbound transport format'); 
    }
    
  } catch (error) {
    console.error('❌ Failed to start MCP server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handling
 */
process.on('SIGINT', async () => {
  console.log('\\n🔄 Shutting down MCP server...');
  try {
    await server.close();
    console.log('✅ MCP server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\\n🔄 Received SIGTERM, shutting down MCP server...');
  try {
    await server.close();
    console.log('✅ MCP server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  console.error('❌ Fatal error starting MCP server:', error);
  process.exit(1);
});
