"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Beef, Apple, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { FoodData } from "@/lib/types"

interface FoodConsumptionFormProps {
  data: FoodData
  onChange: (data: Partial<FoodData>) => void
  onNext: () => void
  onBack: () => void
}

export default function FoodConsumptionForm({ data, onChange, onNext, onBack }: FoodConsumptionFormProps) {
  const [formData, setFormData] = useState<FoodData>(data)
  const [inputValues, setInputValues] = useState({
    meatConsumption: data.meatConsumption.toString(),
    localFoodPercentage: data.localFoodPercentage.toString(),
    foodWaste: data.foodWaste.toString(),
  })

  useEffect(() => {
    setFormData(data)
    setInputValues({
      meatConsumption: data.meatConsumption.toString(),
      localFoodPercentage: data.localFoodPercentage.toString(),
      foodWaste: data.foodWaste.toString(),
    })
  }, [data])

  const handleChange = (field: keyof FoodData, value: number) => {
    // Ensure value is not negative
    const validValue = Math.max(0, value)
    const newData = { ...formData, [field]: validValue }
    setFormData(newData)
    onChange(newData)
  }

  // Handle input change with formatting
  const handleInputChange = (field: keyof FoodData, value: string) => {
    // Store the raw input value for display
    setInputValues((prev) => ({ ...prev, [field]: value }))

    // Remove any non-numeric characters except for the first decimal point
    let sanitizedValue = value.replace(/[^\d.]/g, "")

    // Ensure only one decimal point
    const decimalCount = (sanitizedValue.match(/\./g) || []).length
    if (decimalCount > 1) {
      const firstDecimalIndex = sanitizedValue.indexOf(".")
      sanitizedValue =
        sanitizedValue.substring(0, firstDecimalIndex + 1) +
        sanitizedValue.substring(firstDecimalIndex + 1).replace(/\./g, "")
    }

    // Remove leading zeros unless it's just "0"
    if (sanitizedValue !== "0" && sanitizedValue !== "") {
      sanitizedValue = sanitizedValue.replace(/^0+/, "")
      // If we removed all leading zeros and there's a decimal point at the start, add a 0 back
      if (sanitizedValue.startsWith(".")) {
        sanitizedValue = "0" + sanitizedValue
      }
    }

    // If empty, set to 0
    if (sanitizedValue === "") {
      sanitizedValue = "0"
    }

    // Parse to number
    let numValue = Number.parseFloat(sanitizedValue)

    // Check percentage values
    if (field === "localFoodPercentage" || field === "foodWaste") {
      if (numValue > 100) {
        // Reset to 0
        numValue = 0
        // Update the input display value immediately
        setInputValues((prev) => ({ ...prev, [field]: "0" }))

        // Show toast notification
        toast({
          title: "Invalid percentage",
          description: "The maximum percentage allowed is 100%. Value has been reset to 0.",
          variant: "destructive",
        })
      }
    }

    // Update the form data with the numeric value
    if (!isNaN(numValue)) {
      handleChange(field, numValue)
    }
  }

  // Format display value to remove leading zeros
  const formatDisplayValue = (field: keyof FoodData) => {
    const value = inputValues[field]

    // If it's empty or just "0", return it as is
    if (value === "" || value === "0") {
      return "0"
    }

    // Remove leading zeros
    let formatted = value.replace(/^0+/, "")

    // If we removed all leading zeros and there's a decimal point at the start, add a 0 back
    if (formatted.startsWith(".")) {
      formatted = "0" + formatted
    }

    // If it became empty after removing zeros, return "0"
    return formatted === "" ? "0" : formatted
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
          <Apple className="h-6 w-6" /> Food Consumption
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Tell us about your food habits to calculate your carbon footprint.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="meatConsumption" className="flex items-center gap-2 dark:text-gray-200">
            <Beef className="h-4 w-4" /> Meat consumption (servings per week)
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="meatConsumption"
              min={0}
              max={21}
              step={1}
              value={[formData.meatConsumption]}
              onValueChange={(value) => {
                handleChange("meatConsumption", value[0])
                setInputValues((prev) => ({ ...prev, meatConsumption: value[0].toString() }))
              }}
              className="flex-1"
            />
            <Input
              type="text"
              inputMode="numeric"
              value={formatDisplayValue("meatConsumption")}
              onChange={(e) => handleInputChange("meatConsumption", e.target.value)}
              className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="localFoodPercentage" className="dark:text-gray-200">
            Percentage of locally sourced food (%)
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="localFoodPercentage"
              min={0}
              max={100}
              step={5}
              value={[formData.localFoodPercentage]}
              onValueChange={(value) => {
                // Ensure the value doesn't exceed 100
                if (value[0] > 100) {
                  toast({
                    title: "Invalid percentage",
                    description: "The maximum percentage allowed is 100%. Value has been reset to 0.",
                    variant: "destructive",
                  })
                  handleChange("localFoodPercentage", 0)
                  setInputValues((prev) => ({ ...prev, localFoodPercentage: "0" }))
                } else {
                  handleChange("localFoodPercentage", value[0])
                  setInputValues((prev) => ({ ...prev, localFoodPercentage: value[0].toString() }))
                }
              }}
              className="flex-1"
            />
            <Input
              type="text"
              inputMode="numeric"
              value={formatDisplayValue("localFoodPercentage")}
              onChange={(e) => handleInputChange("localFoodPercentage", e.target.value)}
              className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="foodWaste" className="flex items-center gap-2 dark:text-gray-200">
            <Trash2 className="h-4 w-4" /> Food waste percentage (%)
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="foodWaste"
              min={0}
              max={50}
              step={1}
              value={[formData.foodWaste]}
              onValueChange={(value) => {
                // Ensure the value doesn't exceed 100
                if (value[0] > 100) {
                  toast({
                    title: "Invalid percentage",
                    description: "The maximum percentage allowed is 100%. Value has been reset to 0.",
                    variant: "destructive",
                  })
                  handleChange("foodWaste", 0)
                  setInputValues((prev) => ({ ...prev, foodWaste: "0" }))
                } else {
                  handleChange("foodWaste", value[0])
                  setInputValues((prev) => ({ ...prev, foodWaste: value[0].toString() }))
                }
              }}
              className="flex-1"
            />
            <Input
              type="text"
              inputMode="numeric"
              value={formatDisplayValue("foodWaste")}
              onChange={(e) => handleInputChange("foodWaste", e.target.value)}
              className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="dark:border-gray-600 dark:text-gray-200">
          Back
        </Button>
        <Button onClick={onNext} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
          Next
        </Button>
      </div>
    </div>
  )
}

