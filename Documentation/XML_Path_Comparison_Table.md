# XML Data Points Comparison: Inbound vs Outbound

This document compares the common data points between the inbound tour XML structure and the outbound transport XML structure, showing their respective paths and sample values.

## Structure Overview

- **Inbound**: `<tour>` → `<shipment>` structure
- **Outbound**: `<transport>` → `<shipments><shipment>` structure

## Common Data Points Comparison

| Data Point                        | Inbound XML Path                                                      | Outbound XML Path                        | Inbound Sample Value | Outbound Sample Value |
| --------------------------------- | --------------------------------------------------------------------- | ---------------------------------------- | -------------------- | --------------------- |
| **Tour ID**                 | `/tour/@id`                                                         | *No equivalent*                        | `895851881`        | *N/A*               |
| **Transport Number**        | `/tour/alphanumeric_number`                                         | `/transport/number`                    | `611441-812203`    | `812203`            |
| **Shipment ID**             | `/tour/shipment/@id`                                                | *No equivalent*                        | `556898153`        | *N/A*               |
| **Shipment Number**         | `/tour/shipment/number`                                             | `/transport/shipments/shipment/number` | `611441-2216281`   | `2216281`           |
| **Shipper/Company ID**      | `/tour/company_id`                                                  | `/transport/shipper_id`                | `454692`           | `454692`            |
| **Plant**                   | `/tour/plant`                                                       | `/transport/plant`                     | `DE Koerdel`       | `DE Koerdel`        |
| **Vehicle ID**              | `/tour/vehicle_id`                                                  | `/transport/vehicle_id`                | `vehicleTanker`    | `vehicleTanker`     |
| **License Plate (Truck)**   | `/tour/parameters/parameter[qualifier="licenceplate"]/value`        | `/transport/license_plate_truck`       | `9481/S-738`       | `9481/S-738`        |
| **License Plate (Trailer)** | `/tour/parameters/parameter[qualifier="licenceplatetrailer"]/value` | `/transport/license_plate_trailer`     | `9481/SH-738`      | `9481/SH-738`       |
| **Basic Price**             | `/tour/price_basic`                                                 | `/transport/price_basic`               | `0.00`             | `0`                 |
| **Weight**                  | `/tour/weight`                                                      | *Values don't match* | `28627.20`         | `0` (outbound)                |
| **Volume**                  | `/tour/volume`                                                      | *Values don't match* | `34080.00`         | `0` (outbound)                |
| **Length**                  | `/tour/length`                                                      | `/transport/shipments/shipment/length` | `0.00`             | `0`                 |
| **Route**                   | `/tour/route`                                                       | `/transport/shipments/shipment/route`  | `0.00`             | `0`                 |

## Station Information Comparison

| Station Data                  | Inbound XML Path                                           | Outbound XML Path                                                         | Inbound Sample              | Outbound Sample             |
| ----------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------- | --------------------------- |
| **Loading Company**     | `/tour/shipment/station[@type="loading"]/company_name`   | `/transport/shipments/shipment/station[@type="loading"]/company_name`   | `Shell Int. Trading`      | `Shell Int. Trading`      |
| **Loading Address**     | `/tour/shipment/station[@type="loading"]/address`        | `/transport/shipments/shipment/station[@type="loading"]/address`        | `Liebigstraße 93`        | `Liebigstraße 93`        |
| **Loading ZIP**         | `/tour/shipment/station[@type="loading"]/zip`            | `/transport/shipments/shipment/station[@type="loading"]/zip`            | `65439`                   | `65439`                   |
| **Loading City**        | `/tour/shipment/station[@type="loading"]/city`           | `/transport/shipments/shipment/station[@type="loading"]/city`           | `Flörsheim`              | `Flörsheim`              |
| **Loading Country**     | `/tour/shipment/station[@type="loading"]/country_id`     | `/transport/shipments/shipment/station[@type="loading"]/country_id`     | `DE`                      | `DE`                      |
| **Loading Reference**   | `/tour/shipment/station[@type="loading"]/loading_nr`     | `/transport/shipments/shipment/station[@type="loading"]/loading_name`   | `D003`                    | `D003`                    |
| **Unloading Company**   | `/tour/shipment/station[@type="unloading"]/company_name` | `/transport/shipments/shipment/station[@type="unloading"]/company_name` | `Shell TS RODGAU A3 Nord` | `Shell TS RODGAU A3 Nord` |
| **Unloading Address**   | `/tour/shipment/station[@type="unloading"]/address`      | `/transport/shipments/shipment/station[@type="unloading"]/address`      | `A3 WEISKIRCHEN NORD`     | `A3 WEISKIRCHEN NORD`     |
| **Unloading ZIP**       | `/tour/shipment/station[@type="unloading"]/zip`          | `/transport/shipments/shipment/station[@type="unloading"]/zip`          | `63512`                   | `63512`                   |
| **Unloading City**      | `/tour/shipment/station[@type="unloading"]/city`         | `/transport/shipments/shipment/station[@type="unloading"]/city`         | `RODGAU`                  | `RODGAU`                  |
| **Unloading Country**   | `/tour/shipment/station[@type="unloading"]/country_id`   | `/transport/shipments/shipment/station[@type="unloading"]/country_id`   | `DE`                      | `DE`                      |
| **Unloading Reference** | `/tour/shipment/station[@type="unloading"]/loading_nr`   | `/transport/shipments/shipment/station[@type="unloading"]/loading_name` | `10024994`                | `10024994`                |

## Date/Time Information Comparison

| Time Data                    | Inbound XML Path                                       | Outbound XML Path                                                                    | Inbound Format    | Outbound Format          |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------ | ----------------- | ------------------------ |
| **Loading Start Date** | `/tour/shipment/station[@type="loading"]/from_date`  | `/transport/shipments/shipment/station[@type="loading"]/date_time_period/start`    | `2025-10-20`    | `2025-10-20T03:33:00Z` |
| **Loading Start Time** | `/tour/shipment/station[@type="loading"]/from_time`  | *Combined in start element*                                                        | `03:33`         | *Combined*             |
| **Loading End Date**   | `/tour/shipment/station[@type="loading"]/until_date` | `/transport/shipments/shipment/station[@type="loading"]/date_time_period/end`      | `2025-10-20`    | `2025-10-20T03:43:00Z` |
| **Loading End Time**   | `/tour/shipment/station[@type="loading"]/until_time` | *Combined in end element*                                                          | `03:43`         | *Combined*             |
| **Timezone**           | `/tour/shipment/station[@type="loading"]/timezone`   | `/transport/shipments/shipment/station[@type="loading"]/date_time_period/timezone` | `Europe/Berlin` | `Europe/Berlin`        |

## Item Information Comparison

**🔑 Key Point**: The most important aspect is that the **final tag names and structures are identical** between inbound and outbound formats, ensuring full item data compatibility.

| Final Element Structure     | Inbound XML Path                                                                  | Outbound XML Path                                                                                | Values Match | Sample Values |
| --------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------ | --------------- |
| **`.../pos_number`**      | `/tour/shipment/items/item/pos_number`                                          | `/transport/shipments/shipment/items/item/pos_number`                                          | ✅ Yes        | `6766213`     |
| **`.../pos_index`**       | `/tour/shipment/items/item/pos_index`                                           | `/transport/shipments/shipment/items/item/pos_index`                                           | ✅ Yes        | `6766213`     |
| **`.../description`**     | `/tour/shipment/items/item/description`                                         | `/transport/shipments/shipment/items/item/description`                                         | ✅ Yes        | `Super E10 S` |
| **`.../short_description`** | `/tour/shipment/items/item/short_description`                                   | `/transport/shipments/shipment/items/item/short_description`                                   | ✅ Yes        | `E10`         |
| **`.../material_number`** | `/tour/shipment/items/item/material_number`                                     | `/transport/shipments/shipment/items/item/material_number`                                     | ✅ Yes        | `400001633`   |
| **`.../quantities/quantity/value`** | `/tour/shipment/items/item/quantities/quantity/value`                           | `/transport/shipments/shipment/items/item/quantities/quantity/value`                           | ✅ Yes        | `6500.0` → `6500` |
| **`.../quantities/quantity/unit`**  | `/tour/shipment/items/item/quantities/quantity/unit`                            | `/transport/shipments/shipment/items/item/quantities/quantity/unit`                            | ✅ Yes        | `l`           |
| **`.../parameters/parameter[qualifier="tank.number"]/value`** | `/tour/shipment/items/item/parameters/parameter[qualifier="tank.number"]/value` | `/transport/shipments/shipment/items/item/parameters/parameter[qualifier="tank.number"]/value` | ✅ Yes        | `8` (CDATA) → `8` |

### Item Structure Compatibility Summary
- ✅ **Identical final tags**: `pos_number`, `pos_index`, `description`, `short_description`, `material_number`
- ✅ **Same quantities structure**: `quantities/quantity/value` and `quantities/quantity/unit` 
- ✅ **Compatible parameter system**: `parameters/parameter[qualifier="..."]/value`
- ✅ **Same item hierarchy**: Both use `items/item/` container structure
- ⚠️ **Value formatting**: Decimal precision differences (`6500.0` → `6500`) and CDATA removal

## Parameters Comparison

**🔑 Key Point**: Parameters exist at **multiple levels** (tour/transport, shipment, and item), and the most important aspect is that the `qualifier` attribute values are identical across all levels between inbound and outbound formats.

### Multi-Level Parameter Structure

| Level | Inbound Path Pattern | Outbound Path Pattern | Key Point |
|-------|---------------------|----------------------|-----------|
| **Tour/Transport Level** | `/tour/parameters/parameter[qualifier="..."]` | `/transport/parameters/parameter[qualifier="..."]` | Top-level transport parameters |
| **Shipment Level** | `/tour/shipment/parameters/parameter[qualifier="..."]` | `/transport/shipments/shipment/parameters/parameter[qualifier="..."]` | Shipment-specific parameters |
| **Item Level** | `/tour/shipment/items/item/parameters/parameter[qualifier="..."]` | `/transport/shipments/shipment/items/item/parameters/parameter[qualifier="..."]` | Item-specific parameters |

### Parameter Examples by Level

| Parameter `qualifier` | Level | Inbound XML Path | Outbound XML Path | Values Match | Notes |
| -------------------- | ----- | ---------------- | ----------------- | ------------ | ----- |
| **`truck_id`** | Tour/Transport | `/tour/parameters/parameter[qualifier="truck_id"]/value` | `/transport/parameters/parameter[qualifier="truck_id"]/value` | ✅ Yes | Both contain `9481` |
| **`fuel_type`** | Tour/Transport | `/tour/parameters/parameter[qualifier="fuel_type"]/value` | `/transport/parameters/parameter[qualifier="fuel_type"]/value` | ✅ Yes | Both contain `Diesel` |
| **`bol`** | Item | `/tour/shipment/items/item/parameters/parameter[qualifier="bol"]` | `/transport/shipments/shipment/items/item/parameters/parameter[qualifier="bol"]` | ✅ Yes | Present in both (empty value) |
| **`tank.number`** | Item | `/tour/shipment/items/item/parameters/parameter[qualifier="tank.number"]/value` | `/transport/shipments/shipment/items/item/parameters/parameter[qualifier="tank.number"]/value` | ✅ Yes | Both contain tank numbers (`8`, `4`, `2`, `1`, `6`) |
| **`compartment.number`** | Item | `/tour/shipment/items/item/parameters/parameter[qualifier="compartment.number"]` | `/transport/shipments/shipment/items/item/parameters/parameter[qualifier="compartment.number"]` | ✅ Yes | Present in both (empty value) |

### Parameter Compatibility Summary
- ✅ **Compatible qualifiers**: Both formats use identical `qualifier` attribute values
- ✅ **Structure consistency**: Parameter elements follow the same `<parameter><qualifier>value</qualifier><value>content</value></parameter>` pattern
- ⚠️ **Attribute differences**: Inbound has visibility attributes (`export2carrier`, `visibilityCarrier`, etc.) that are absent in outbound
- ⚠️ **CDATA differences**: Inbound uses CDATA sections, outbound uses direct text values

## Key Structural Differences

1. **Root Element**: `<tour>` vs `<transport>`
2. **Shipment Container**: Direct `<shipment>` vs `<shipments><shipment>`
3. **Date/Time Format**: Separate date/time fields vs combined ISO 8601 timestamps
4. **Parameter Values**: CDATA sections in inbound vs direct text in outbound
5. **Visibility Attributes**: Inbound parameters have extensive visibility attributes, outbound parameters are simplified
6. **Complexity**: Inbound contains much more detailed metadata and parameters

## Transformation Considerations

When transforming from inbound to outbound format:

- Combine separate date/time fields into ISO 8601 timestamps
- Remove CDATA sections from parameter values
- Remove visibility and export attributes from parameters
- Simplify nested shipment structure
- Filter out inbound-specific metadata fields
- **⚠️ Weight and Volume**: Inbound has actual values (`28627.20`, `34080.00`) while outbound shows `0` - requires investigation
- **Note**: Weight and Volume may need to be calculated/aggregated differently in outbound format
- Preserve core business data (items, stations, vehicle info)
