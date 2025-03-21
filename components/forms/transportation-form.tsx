"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Car, Bus, Plane } from "lucide-react"
import type { TransportationData } from "@/lib/types"

interface TransportationFormProps {
  data: TransportationData
  onChange: (data: Partial<TransportationData>) => void
  onNext: () => void
}

export default function TransportationForm({ data, onChange, onNext }: TransportationFormProps) {
  const [formData, setFormData] = useState<TransportationData>(data)
  const [inputValues, setInputValues] = useState({
    carMileage: data.carMileage.toString(),
    carEfficiency: data.carEfficiency.toString(),
    publicTransport: data.publicTransport.toString(),
    flights: data.flights.toString(),
  })

  useEffect(() => {
    setFormData(data)
    setInputValues({
      carMileage: data.carMileage.toString(),
      carEfficiency: data.carEfficiency.toString(),
      publicTransport: data.publicTransport.toString(),
      flights: data.flights.toString(),
    })
  }, [data])

  const handleChange = (field: keyof TransportationData, value: number) => {
    // Ensure value is not negative
    const validValue = Math.max(0, value)
    const newData = { ...formData, [field]: validValue }
    setFormData(newData)
    onChange(newData)
  }

  // Handle input change with formatting
  const handleInputChange = (field: keyof TransportationData, value: string) => {
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
    const numValue = Number.parseFloat(sanitizedValue)

    // Update the form data with the numeric value
    if (!isNaN(numValue)) {
      handleChange(field, numValue)
    }
  }

  // Format display value to remove leading zeros
  const formatDisplayValue = (field: keyof TransportationData) => {
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
          <Car className="h-6 w-6" /> Transportation
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Tell us about your transportation habits to calculate your carbon footprint.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="carMileage" className="dark:text-gray-200">
            Annual car mileage (miles)
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="carMileage"
              min={0}
              max={50000}
              step={100}
              value={[formData.carMileage]}
              onValueChange={(value) => {
                handleChange("carMileage", value[0])
                setInputValues((prev) => ({ ...prev, carMileage: value[0].toString() }))
              }}
              className="flex-1"
            />
            <Input
              type="text"
              inputMode="numeric"
              value={formatDisplayValue("carMileage")}
              onChange={(e) => handleInputChange("carMileage", e.target.value)}
              className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="carEfficiency" className="dark:text-gray-200">
            Car fuel efficiency (MPG)
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="carEfficiency"
              min={10}
              max={60}
              step={1}
              value={[formData.carEfficiency]}
              onValueChange={(value) => {
                handleChange("carEfficiency", value[0])
                setInputValues((prev) => ({ ...prev, carEfficiency: value[0].toString() }))
              }}
              className="flex-1"
            />
            <Input
              type="text"
              inputMode="numeric"
              value={formatDisplayValue("carEfficiency")}
              onChange={(e) => handleInputChange("carEfficiency", e.target.value)}
              className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="publicTransport" className="flex items-center gap-2 dark:text-gray-200">
            <Bus className="h-4 w-4" /> Public transportation (miles per year)
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="publicTransport"
              min={0}
              max={10000}
              step={100}
              value={[formData.publicTransport]}
              onValueChange={(value) => {
                handleChange("publicTransport", value[0])
                setInputValues((prev) => ({ ...prev, publicTransport: value[0].toString() }))
              }}
              className="flex-1"
            />
            <Input
              type="text"
              inputMode="numeric"
              value={formatDisplayValue("publicTransport")}
              onChange={(e) => handleInputChange("publicTransport", e.target.value)}
              className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="flights" className="flex items-center gap-2 dark:text-gray-200">
            <Plane className="h-4 w-4" /> Number of flights per year (round trips)
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="flights"
              min={0}
              max={20}
              step={1}
              value={[formData.flights]}
              onValueChange={(value) => {
                handleChange("flights", value[0])
                setInputValues((prev) => ({ ...prev, flights: value[0].toString() }))
              }}
              className="flex-1"
            />
            <Input
              type="text"
              inputMode="numeric"
              value={formatDisplayValue("flights")}
              onChange={(e) => handleInputChange("flights", e.target.value)}
              className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
          Next
        </Button>
      </div>
    </div>
  )
}

