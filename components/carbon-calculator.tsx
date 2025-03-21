"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import TransportationForm from "./forms/transportation-form"
import HomeEnergyForm from "./forms/home-energy-form"
import FoodConsumptionForm from "./forms/food-consumption-form"
import LifestyleForm from "./forms/lifestyle-form"
import ResultsVisualization from "./results-visualization"
import { calculateTotalFootprint } from "@/lib/carbon-calculations"
import type { CarbonData, FootprintResults } from "@/lib/types"

export default function CarbonCalculator() {
  const [activeTab, setActiveTab] = useState("transportation")
  const [showResults, setShowResults] = useState(false)
  const [carbonData, setCarbonData] = useState<CarbonData>({
    transportation: {
      carMileage: 5000,
      carEfficiency: 25,
      publicTransport: 1000,
      flights: 2,
    },
    homeEnergy: {
      electricityUsage: 300,
      gasUsage: 50,
      renewablePercentage: 20,
    },
    food: {
      meatConsumption: 3,
      localFoodPercentage: 30,
      foodWaste: 15,
    },
    lifestyle: {
      shoppingFrequency: 2,
      recyclingPercentage: 50,
    },
  })
  const [results, setResults] = useState<FootprintResults | null>(null)

  const handleDataChange = (category: keyof CarbonData, data: any) => {
    setCarbonData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...data,
      },
    }))
  }

  const handleCalculate = () => {
    const calculatedResults = calculateTotalFootprint(carbonData)
    setResults(calculatedResults)
    setShowResults(true)
  }

  return (
    <>
      <Card className="shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full rounded-none rounded-t-lg text-[10px] xs:text-xs sm:text-sm">
              <TabsTrigger value="transportation" className="px-1 sm:px-2">
                Transport
              </TabsTrigger>
              <TabsTrigger value="homeEnergy" className="px-1 sm:px-2">
                Energy
              </TabsTrigger>
              <TabsTrigger value="food" className="px-1 sm:px-2">
                Food
              </TabsTrigger>
              <TabsTrigger value="lifestyle" className="px-1 sm:px-2">
                Lifestyle
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transportation" className="p-4 sm:p-6">
              <TransportationForm
                data={carbonData.transportation}
                onChange={(data) => handleDataChange("transportation", data)}
                onNext={() => setActiveTab("homeEnergy")}
              />
            </TabsContent>

            <TabsContent value="homeEnergy" className="p-4 sm:p-6">
              <HomeEnergyForm
                data={carbonData.homeEnergy}
                onChange={(data) => handleDataChange("homeEnergy", data)}
                onNext={() => setActiveTab("food")}
                onBack={() => setActiveTab("transportation")}
              />
            </TabsContent>

            <TabsContent value="food" className="p-4 sm:p-6">
              <FoodConsumptionForm
                data={carbonData.food}
                onChange={(data) => handleDataChange("food", data)}
                onNext={() => setActiveTab("lifestyle")}
                onBack={() => setActiveTab("homeEnergy")}
              />
            </TabsContent>

            <TabsContent value="lifestyle" className="p-4 sm:p-6">
              <LifestyleForm
                data={carbonData.lifestyle}
                onChange={(data) => handleDataChange("lifestyle", data)}
                onCalculate={handleCalculate}
                onBack={() => setActiveTab("food")}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {results && <ResultsVisualization results={results} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

