export interface TransportationData {
  carMileage: number
  carEfficiency: number
  publicTransport: number
  flights: number
}

export interface HomeEnergyData {
  electricityUsage: number
  gasUsage: number
  renewablePercentage: number
}

export interface FoodData {
  meatConsumption: number
  localFoodPercentage: number
  foodWaste: number
}

export interface LifestyleData {
  shoppingFrequency: number
  recyclingPercentage: number
}

export interface CarbonData {
  transportation: TransportationData
  homeEnergy: HomeEnergyData
  food: FoodData
  lifestyle: LifestyleData
}

export interface FootprintResults {
  transportation: number
  homeEnergy: number
  food: number
  lifestyle: number
  total: number
}

