# XML Data Comparison: Inbound vs Outbound

## Common Data Points Between Inbound Tour and Outbound Transport Order

| Data Point | Inbound XML (Tour Format) | Outbound XML (Transport Format) | Location/Notes |
|------------|---------------------------|----------------------------------|----------------|
| **Transport/Tour Number** | 895851881 | 812203 | Root element number |
| **Shipment Number** | 611441-2216281 | 2216281 | Shipment identifier |
| **Vehicle Type** | vehicleTanker | vehicleTanker | Vehicle classification |
| **License Plate (Truck)** | 9481/S-738 | 9481/S-738 | Vehicle identification |
| **License Plate (Trailer)** | 9481/SH-738 | 9481/SH-738 | Trailer identification |
| **Truck ID** | 9481 | 9481 | Fleet identifier |
| **Fuel Type** | Diesel | Diesel | Vehicle fuel specification |
| **Company ID** | 454692 | 454692 | Shipper identification |
| **Plant** | DE Koerdel | DE Koerdel | Facility identifier |

## Station Information (Loading)
| Data Point | Inbound XML | Outbound XML | Notes |
|------------|-------------|--------------|-------|
| **Company Name** | Shell Int. Trading | Shell Int. Trading | Loading location |
| **Address** | Liebigstraße 93 | Liebigstraße 93 | Street address |
| **ZIP Code** | 65439 | 65439 | Postal code |
| **City** | Flörsheim | Flörsheim | City name |
| **Country** | DE | DE | Country code |
| **Loading Number** | D003 | D003 | Location identifier |
| **Start Time** | 2025-10-20 03:33 | 2025-10-20T03:33:00Z | Time format differs |
| **End Time** | 2025-10-20 03:43 | 2025-10-20T03:43:00Z | Time format differs |
| **Timezone** | Europe/Berlin | Europe/Berlin | Timezone specification |

## Station Information (Unloading)
| Data Point | Inbound XML | Outbound XML | Notes |
|------------|-------------|--------------|-------|
| **Company Name** | Shell TS RODGAU A3 Nord | Shell TS RODGAU A3 Nord | Unloading location |
| **Address** | A3 WEISKIRCHEN NORD | A3 WEISKIRCHEN NORD | Street address |
| **ZIP Code** | 63512 | 63512 | Postal code |
| **City** | RODGAU | RODGAU | City name |
| **Country** | DE | DE | Country code |
| **Loading Number** | 10024994 | 10024994 | Location identifier |
| **Start Time** | 2025-10-20 03:43 | 2025-10-20T03:43:00Z | Time format differs |
| **End Time** | 2025-10-20 04:03 | 2025-10-20T04:03:00Z | Time format differs |
| **Timezone** | Europe/Berlin | Europe/Berlin | Timezone specification |

## Item Details
| Item | Position Number | Description | Material Number | Volume (l) | Tank Number |
|------|----------------|-------------|-----------------|------------|-------------|
| **Item 1** | 6766213 | Super E10 S / E10 | 400001633 | 6500 | 8 |
| **Item 2** | 6766217 | FSDK | 400002130 | 4080 | 4 |
| **Item 3** | 6766216 | FSDK | 400002130 | 5000 | 2 |
| **Item 4** | 6766215 | FSDK | 400002130 | 5000 | 1 |
| **Item 5** | 6766219 | STDK | 400001682 | 13500 | 6 |

## Key Differences in Structure

### Inbound XML (Tour Format)
- More detailed metadata and parameters
- Contains extensive visibility and export settings
- Includes auction information
- Has emission calculations
- Contains many business-specific parameters
- Nested parameter structure with visibility controls

### Outbound XML (Transport Format) 
- Simplified structure focused on transport execution
- Cleaner datetime format (ISO 8601)
- Fewer parameters and metadata
- More streamlined for operational use
- Direct value assignments without complex parameter structures

## Total Volume Summary
- **Combined Volume**: 34,080 liters
- **Number of Items**: 5
- **Tank Compartments Used**: 1, 2, 4, 6, 8

## Time Window
- **Loading**: 2025-10-20 03:33 - 03:43 (10 minutes)
- **Unloading**: 2025-10-20 03:43 - 04:03 (20 minutes)
- **Total Transport Duration**: 30 minutes



