// Frontend constants mirroring backend constants
export const TRUCK_TYPES = {
  FLATBED: 'flatbed',
  CONTAINER: 'container',
  REFRIGERATED: 'refrigerated',
  TANKER: 'tanker',
  BOX: 'box',
  OTHER: 'other'
};

// Equipment types for rental
export const EQUIPMENT_TYPES = {
  CRANE: 'crane',
  MOBILE_CRANE: 'mobile_crane',
  TOWER_CRANE: 'tower_crane',
  FORKLIFT: 'forklift',
  REACH_TRUCK: 'reach_truck',
  PALLET_JACK: 'pallet_jack',
  EXCAVATOR: 'excavator',
  BULLDOZER: 'bulldozer',
  LOADER: 'loader',
  DUMP_TRUCK: 'dump_truck',
  CONCRETE_MIXER: 'concrete_mixer',
  OTHER: 'other'
};

// Combined vehicle/equipment types
export const VEHICLE_TYPES = {
  ...TRUCK_TYPES,
  ...EQUIPMENT_TYPES
};

export const TRUCK_TYPE_LABELS = {
  [TRUCK_TYPES.FLATBED]: 'Flatbed',
  [TRUCK_TYPES.CONTAINER]: 'Container',
  [TRUCK_TYPES.REFRIGERATED]: 'Refrigerated',
  [TRUCK_TYPES.TANKER]: 'Tanker',
  [TRUCK_TYPES.BOX]: 'Box Truck',
  [TRUCK_TYPES.OTHER]: 'Other'
};

export const EQUIPMENT_TYPE_LABELS = {
  [EQUIPMENT_TYPES.CRANE]: 'Crane',
  [EQUIPMENT_TYPES.MOBILE_CRANE]: 'Mobile Crane',
  [EQUIPMENT_TYPES.TOWER_CRANE]: 'Tower Crane',
  [EQUIPMENT_TYPES.FORKLIFT]: 'Forklift',
  [EQUIPMENT_TYPES.REACH_TRUCK]: 'Reach Truck',
  [EQUIPMENT_TYPES.PALLET_JACK]: 'Pallet Jack',
  [EQUIPMENT_TYPES.EXCAVATOR]: 'Excavator',
  [EQUIPMENT_TYPES.BULLDOZER]: 'Bulldozer',
  [EQUIPMENT_TYPES.LOADER]: 'Loader',
  [EQUIPMENT_TYPES.DUMP_TRUCK]: 'Dump Truck',
  [EQUIPMENT_TYPES.CONCRETE_MIXER]: 'Concrete Mixer',
  [EQUIPMENT_TYPES.OTHER]: 'Other Equipment'
};

// Combined labels
export const VEHICLE_TYPE_LABELS = {
  ...TRUCK_TYPE_LABELS,
  ...EQUIPMENT_TYPE_LABELS
};

export const PRICING_TYPES = {
  PER_KM: 'per_km',
  FIXED: 'fixed'
};

// Rental pricing types
export const RENTAL_PRICING_TYPES = {
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// Service types
export const SERVICE_TYPES = {
  TRANSPORT: 'transport',
  RENTAL: 'rental'
};

export const SERVICE_TYPE_LABELS = {
  [SERVICE_TYPES.TRANSPORT]: 'Transportation',
  [SERVICE_TYPES.RENTAL]: 'Equipment Rental'
};

// Helper functions
export const isEquipmentType = (vehicleType) => {
  return Object.values(EQUIPMENT_TYPES).includes(vehicleType);
};

export const isTruckType = (vehicleType) => {
  return Object.values(TRUCK_TYPES).includes(vehicleType);
};

export const getVehicleTypesByService = (serviceType) => {
  if (serviceType === SERVICE_TYPES.RENTAL) {
    return EQUIPMENT_TYPES;
  } else {
    return TRUCK_TYPES;
  }
};

export const getLabelsByService = (serviceType) => {
  if (serviceType === SERVICE_TYPES.RENTAL) {
    return EQUIPMENT_TYPE_LABELS;
  } else {
    return TRUCK_TYPE_LABELS;
  }
};

export default {
  TRUCK_TYPES,
  TRUCK_TYPE_LABELS,
  EQUIPMENT_TYPES,
  EQUIPMENT_TYPE_LABELS,
  VEHICLE_TYPES,
  VEHICLE_TYPE_LABELS,
  PRICING_TYPES,
  RENTAL_PRICING_TYPES,
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  isEquipmentType,
  isTruckType,
  getVehicleTypesByService,
  getLabelsByService
};
