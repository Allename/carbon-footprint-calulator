import type { CarbonData, FootprintResults } from "./types"

// Constants for carbon calculations
const CARBON_CONSTANTS = {
  // Transportation (in kg CO2 per mile)
  CAR_EMISSIONS_PER_GALLON: 8.89, // kg CO2 per gallon of gasoline
  PUBLIC_TRANSPORT_EMISSIONS_PER_MILE: 0.14, // kg CO2 per mile
  FLIGHT_EMISSIONS_PER_TRIP: 1100, // kg CO2 per round trip flight (average)

  // Home Energy
  ELECTRICITY_EMISSIONS_PER_KWH: 0.4, // kg CO2 per kWh
  GAS_EMISSIONS_PER_THERM: 5.3, // kg CO2 per therm

  // Food
  MEAT_EMISSIONS_PER_SERVING: 3.0, // kg CO2 per serving
  LOCAL_FOOD_REDUCTION_FACTOR: 0.2, // 20% reduction for local food
  FOOD_WASTE_FACTOR: 0.01, // 1% increase per 1% of food waste

  // Lifestyle
  SHOPPING_EMISSIONS_PER_ITEM: 25, // kg CO2 per new item
  RECYCLING_REDUCTION_FACTOR: 0.003, // 0.3% reduction per 1% of recycling
}

export function calculateTotalFootprint(data: CarbonData): FootprintResults {
  // Calculate transportation footprint
  const carEmissions =
    (data.transportation.carMileage / data.transportation.carEfficiency) * CARBON_CONSTANTS.CAR_EMISSIONS_PER_GALLON
  const publicTransportEmissions =
    data.transportation.publicTransport * CARBON_CONSTANTS.PUBLIC_TRANSPORT_EMISSIONS_PER_MILE
  const flightEmissions = data.transportation.flights * CARBON_CONSTANTS.FLIGHT_EMISSIONS_PER_TRIP
  const transportationTotal = (carEmissions + publicTransportEmissions + flightEmissions) / 1000 // Convert to tons

  // Calculate home energy footprint
  const electricityEmissions =
    data.homeEnergy.electricityUsage *
    12 * // Annual usage
    CARBON_CONSTANTS.ELECTRICITY_EMISSIONS_PER_KWH *
    (1 - data.homeEnergy.renewablePercentage / 100)
  const gasEmissions =
    data.homeEnergy.gasUsage *
    12 * // Annual usage
    CARBON_CONSTANTS.GAS_EMISSIONS_PER_THERM
  const homeEnergyTotal = (electricityEmissions + gasEmissions) / 1000 // Convert to tons

  // Calculate food footprint
  const meatEmissions =
    data.food.meatConsumption *
    52 * // Annual consumption
    CARBON_CONSTANTS.MEAT_EMISSIONS_PER_SERVING
  const localFoodReduction =
    meatEmissions * (data.food.localFoodPercentage / 100) * CARBON_CONSTANTS.LOCAL_FOOD_REDUCTION_FACTOR
  const foodWasteIncrease = meatEmissions * data.food.foodWaste * CARBON_CONSTANTS.FOOD_WASTE_FACTOR
  const foodTotal = (meatEmissions - localFoodReduction + foodWasteIncrease) / 1000 // Convert to tons

  // Calculate lifestyle footprint
  const shoppingEmissions =
    data.lifestyle.shoppingFrequency *
    12 * // Annual purchases
    CARBON_CONSTANTS.SHOPPING_EMISSIONS_PER_ITEM
  const recyclingReduction =
    shoppingEmissions * data.lifestyle.recyclingPercentage * CARBON_CONSTANTS.RECYCLING_REDUCTION_FACTOR
  const lifestyleTotal = (shoppingEmissions - recyclingReduction) / 1000 // Convert to tons

  // Calculate total footprint
  const total = transportationTotal + homeEnergyTotal + foodTotal + lifestyleTotal

  return {
    transportation: transportationTotal,
    homeEnergy: homeEnergyTotal,
    food: foodTotal,
    lifestyle: lifestyleTotal,
    total,
  }
}

