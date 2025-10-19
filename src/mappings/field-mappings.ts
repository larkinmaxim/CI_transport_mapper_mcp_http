/**
 * Field mappings for transforming inbound tour XML to outbound transport XML
 * Based on XML_Path_Comparison_Table.md mapping rules
 */

import { 
  InboundTour, 
  InboundShipment, 
  InboundStation, 
  InboundItems, 
  InboundItem,
  InboundQuantities,
  OutboundTransport, 
  OutboundShipment, 
  OutboundStation, 
  OutboundItems, 
  OutboundItem,
  OutboundQuantities
} from '../types/index.js';
import { 
  combineDateTimeToISO, 
  extractTransportNumber, 
  extractShipmentNumber,
  extractParameterValue,
  processParameters 
} from '../utils/transformation-utils.js';

/**
 * Main transformation function: converts inbound tour to outbound transport
 * @param inbound - Parsed inbound tour XML data
 * @returns Outbound transport data structure
 */
export function transformTourToTransport(inbound: any): OutboundTransport {
  const tour = inbound.tour;
  const shipment = tour.shipment[0]; // shipment is an array with one element

  return {
    transport: {
      // Root level mappings from tour
      number: extractTransportNumber(tour.alphanumeric_number[0]),
      shipper_id: tour.company_id[0],
      vehicle_id: tour.vehicle_id[0],
      plant: tour.plant[0],
      price_basic: parseFloat(tour.price_basic?.[0] || '0') || 0,
      
      // License plates from tour parameters
      license_plate_truck: extractParameterValue(tour.parameters, 'licenceplate'),
      license_plate_trailer: extractParameterValue(tour.parameters, 'licenceplatetrailer'),
      
      // Shipments container
      shipments: {
        shipment: transformShipment(shipment)
      },
      
      // Transport-level parameters
      parameters: processParameters(tour.parameters[0])
    }
  };
}

/**
 * Transforms a single shipment from inbound to outbound format
 * @param shipment - Inbound shipment data
 * @returns Outbound shipment structure
 */
function transformShipment(shipment: InboundShipment): OutboundShipment {
  return {
    number: extractShipmentNumber(shipment.number[0]),
    shipper_id: shipment.company_id[0],
    plant: shipment.plant[0],
    
    // Note: Inbound has actual values, outbound shows 0 according to mapping table
    weight: 0,
    volume: 0,
    length: parseFloat(shipment.length[0]) || 0,
    route: parseFloat(shipment.route[0]) || 0,
    
    // Transport unit info (mapped from inbound station data)
    transportunit_count: parseInt(shipment.station?.[0]?.transportunit_count?.[0] || '0') || 0,
    transportunit_pileable: shipment.station?.[0]?.transportunit_pileable?.[0] === '1',
    transportunit_exchange: shipment.station?.[0]?.transportunit_exchange?.[0] === '1',
    
    vehicle_id: shipment.vehicle_id[0],
    storage_position_count: parseFloat(shipment.storageposition_count?.[0] || '0'),
    
    // Stations transformation
    station: transformStations(shipment.station),
    
    // Items transformation
    items: transformItems(shipment.items[0]),
    
    // Shipment-level parameters
    parameters: processParameters(shipment.parameters[0])
  };
}

/**
 * Transforms stations from inbound to outbound format
 * @param stations - Array of inbound stations
 * @returns Array of outbound stations
 */
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
      start: combineDateTimeToISO(
        station.from_date[0], 
        station.from_time[0], 
        station.timezone[0]
      ),
      end: combineDateTimeToISO(
        station.until_date[0], 
        station.until_time[0], 
        station.timezone[0]
      ),
      timezone: station.timezone[0]
    }
  }));
}

/**
 * Transforms items from inbound to outbound format
 * @param items - Inbound items container
 * @returns Outbound items structure
 */
function transformItems(items: InboundItems): OutboundItems {
  return {
    item: items.item.map(item => transformItem(item))
  };
}

/**
 * Transforms a single item from inbound to outbound format
 * @param item - Inbound item data
 * @returns Outbound item structure
 */
function transformItem(item: InboundItem): OutboundItem {
  return {
    pos_number: item.pos_number[0],
    pos_index: item.pos_index[0],
    description: item.description[0],
    short_description: item.short_description[0],
    material_number: item.material_number[0],
    quantities: transformQuantities(item.quantities[0]),
    parameters: processParameters(item.parameters[0])
  };
}

/**
 * Transforms quantities from inbound to outbound format
 * @param quantities - Inbound quantities container
 * @returns Outbound quantities structure
 */
function transformQuantities(quantities: InboundQuantities): OutboundQuantities {
  return {
    quantity: quantities.quantity.map(qty => ({
      qualifier: qty.qualifier[0],
      unit: qty.unit[0],
      value: parseInt(parseFloat(qty.value[0]).toString()) // Remove decimal precision
    }))
  };
}
