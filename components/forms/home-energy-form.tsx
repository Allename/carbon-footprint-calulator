"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Home, Flame, Zap } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { HomeEnergyData } from "@/lib/types"

interface HomeEnergyFormProps {
  data: HomeEnergyData
  onChange: (data: Partial<HomeEnergyData>) => void
  onNext: () => void
  onBack: () => void
}

export default function HomeEnergyForm({ data, onChange, onNext, onBack }: HomeEnergyFormProps) {
  const [formData, setFormData] = useState<HomeEnergyData>(data)
  const [inputValues, setInputValues] = useState({
    electricityUsage: data.electricityUsage.toString(),
    gasUsage: data.gasUsage.toString(),
    renewablePercentage: data.renewablePercentage.toString(),
  })

  useEffect(() => {
    setFormData(data)
    setInputValues({
      electricityUsage: data.electricityUsage.toString(),
      gasUsage: data.gasUsage.toString(),
      renewablePercentage: data.renewablePercentage.toString(),
    })
  }, [data])

  const handleChange = (field: keyof HomeEnergyData, value: number) => {
    // Ensure value is not negative
    const validValue = Math.max(0, value)
    const newData = { ...formData, [field]: validValue }
    setFormData(newData)
    onChange(newData)
  }

  // Handle input change with formatting
  const handleInputChange = (field: keyof HomeEnergyData, value: string) => {
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
    if (field === "renewablePercentage") {
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
  const formatDisplayValue = (field: keyof HomeEnergyData) => {
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
          <Home className="h-6 w-6" /> Home Energy
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Tell us about your home energy usage to calculate your carbon footprint.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="electricityUsage" className="flex items-center gap-2 dark:text-gray-200">
            <Zap className="h-4 w-4" /> Monthly electricity usage (kWh)
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="electricityUsage"
              min={0}
              max={1000}
              step={10}
              value={[formData.electricityUsage]}
              onValueChange={(value) => {
                handleChange("electricityUsage", value[0])
                setInputValues((prev) => ({ ...prev, electricityUsage: value[0].toString() }))
              }}
              className="flex-1"
            />
            <Input
              type="text"
              inputMode="numeric"
              value={formatDisplayValue("electricityUsage")}
              onChange={(e) => handleInputChange("electricityUsage", e.target.value)}
              className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gasUsage" className="flex items-center gap-2 dark:text-gray-200">
            <Flame className="h-4 w-4" /> Monthly natural gas usage (therms)
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="gasUsage"
              min={0}
              max={200}
              step={5}
              value={[formData.gasUsage]}
              onValueChange={(value) => {
                handleChange("gasUsage", value[0])
                setInputValues((prev) => ({ ...prev, gasUsage: value[0].toString() }))
              }}
              className="flex-1"
            />
            <Input
              type="text"
              inputMode="numeric"
              value={formatDisplayValue("gasUsage")}
              onChange={(e) => handleInputChange("gasUsage", e.target.value)}
              className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="renewablePercentage" className="dark:text-gray-200">
            Percentage of renewable energy (%)
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="renewablePercentage"
              min={0}
              max={100}
              step={5}
              value={[formData.renewablePercentage]}
              onValueChange={(value) => {
                // Ensure the value doesn't exceed 100
                if (value[0] > 100) {
                  toast({
                    title: "Invalid percentage",
                    description: "The maximum percentage allowed is 100%. Value has been reset to 0.",
                    variant: "destructive",
                  })
                  handleChange("renewablePercentage", 0)
                  setInputValues((prev) => ({ ...prev, renewablePercentage: "0" }))
                } else {
                  handleChange("renewablePercentage", value[0])
                  setInputValues((prev) => ({ ...prev, renewablePercentage: value[0].toString() }))
                }
              }}
              className="flex-1"
            />
            <Input
              type="text"
              inputMode="numeric"
              value={formatDisplayValue("renewablePercentage")}
              onChange={(e) => handleInputChange("renewablePercentage", e.target.value)}
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

