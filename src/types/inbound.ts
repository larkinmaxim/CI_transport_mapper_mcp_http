/**
 * TypeScript interfaces for inbound tour XML structure
 * Based on the XML structure from Examples/inbound.xml
 */

export interface InboundTour {
  tour: {
    $: { id: string };
    number: string[];
    status: string[];
    plant: string[];
    scheduling_unit_id: string[];
    weight: string[];
    weight_unit: string[];
    length: string[];
    length_unit: string[];
    volume: string[];
    volume_unit: string[];
    route: string[];
    route_unit: string[];
    price_basic: string[];
    currency_id: string[];
    vehicle_id: string[];
    company_id: string[];
    alphanumeric_number: string[];
    shipment: InboundShipment;
    parameters: InboundParameters[];
    start_country_id: string[];
    start_zip: string[];
    start_city: string[];
    end_country_id: string[];
    end_zip: string[];
    end_city: string[];
    start_date: string[];
    start_time: string[];
    end_date: string[];
    end_time: string[];
  };
}

export interface InboundShipment {
  $: { id: string };
  index: string[];
  number: string[];
  type: string[];
  last_modified: string[];
  company_id: string[];
  creator_id: string[];
  transport_id: string[];
  plant: string[];
  vehicle_id: string[];
  weight: string[];
  weight_unit: string[];
  volume: string[];
  volume_unit: string[];
  length: string[];
  length_unit: string[];
  route: string[];
  route_unit: string[];
  dimension_loadingmeter: string[];
  storageposition_count: string[];
  comment: string[];
  plain_comment: string[];
  station: InboundStation[];
  items: InboundItems[];
  parameters: InboundParameters[];
  hide_number_unbooked: string[];
  deliveryVersion: string[];
  are_items_frozen: string[];
  scheduling_unit_id: string[];
  cmrRecipientIsNotDestination: string[];
  cmrRecipientAddress: string[];
  onBehalfOf: string[];
  confirmationStatus: string[];
}

export interface InboundStation {
  $: { type: 'loading' | 'unloading' };
  type: string[];
  index: string[];
  loading_nr: string[];
  company_name: string[];
  address: string[];
  zip: string[];
  city: string[];
  country_id: string[];
  latitude: string[];
  longitude: string[];
  gis_provider: string[];
  from_date: string[];
  from_time: string[];
  until_date: string[];
  until_time: string[];
  timezone: string[];
  transportunit_name: string[];
  transportunit_count: string[];
  transportunit_pileable: string[];
  transportunit_exchange: string[];
  comment: string[];
  plain_comment: string[];
  internal_id: string[];
  place_reference_id: string[];
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
