/**
 * TypeScript interfaces for outbound transport XML structure
 * Based on the XML structure from Examples/outbound.xml
 */

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

// Common types
export interface TransformationMetadata {
  tour_id: string;
  transport_number: string;
  shipment_count: number;
  items_count: number;
  transformation_timestamp: string;
}

export interface TransformationResult {
  result: string;
  metadata: TransformationMetadata;
  summary: string;
  next_action: {
    type: string;
    message: string;
    options: string[];
  };
}



