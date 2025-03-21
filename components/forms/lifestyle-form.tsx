"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ShoppingBag, Recycle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { LifestyleData } from "@/lib/types"

interface LifestyleFormProps {
  data: LifestyleData
  onChange: (data: Partial<LifestyleData>) => void
  onCalculate: () => void
  onBack: () => void
}

export default function LifestyleForm({ data, onChange, onCalculate, onBack }: LifestyleFormProps) {
  const [formData, setFormData] = useState<LifestyleData>(data)
  const [inputValues, setInputValues] = useState({
    shoppingFrequency: data.shoppingFrequency.toString(),
    recyclingPercentage: data.recyclingPercentage.toString(),
  })

  useEffect(() => {
    setFormData(data)
    setInputValues({
      shoppingFrequency: data.shoppingFrequency.toString(),
      recyclingPercentage: data.recyclingPercentage.toString(),
    })
  }, [data])

  const handleChange = (field: keyof LifestyleData, value: number) => {
    // Ensure value is not negative
    const validValue = Math.max(0, value)
    const newData = { ...formData, [field]: validValue }
    setFormData(newData)
    onChange(newData)
  }

  // Handle input change with formatting
  const handleInputChange = (field: keyof LifestyleData, value: string) => {
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
    if (field === "recyclingPercentage") {
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
  const formatDisplayValue = (field: keyof LifestyleData) => {
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
          <ShoppingBag className="h-6 w-6" /> Lifestyle
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Tell us about your lifestyle habits to calculate your carbon footprint.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shoppingFrequency" className="dark:text-gray-200">
            New clothing/electronics purchases per month
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="shoppingFrequency"
              min={0}
              max={10}
              step={1}
              value={[formData.shoppingFrequency]}
              onValueChange={(value) => {
                handleChange("shoppingFrequency", value[0])
                setInputValues((prev) => ({ ...prev, shoppingFrequency: value[0].toString() }))
              }}
              className="flex-1"
            />
            <Input
              type="text"
              inputMode="numeric"
              value={formatDisplayValue("shoppingFrequency")}
              onChange={(e) => handleInputChange("shoppingFrequency", e.target.value)}
              className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recyclingPercentage" className="flex items-center gap-2 dark:text-gray-200">
            <Recycle className="h-4 w-4" /> Percentage of waste recycled (%)
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="recyclingPercentage"
              min={0}
              max={100}
              step={5}
              value={[formData.recyclingPercentage]}
              onValueChange={(value) => {
                // Ensure the value doesn't exceed 100
                if (value[0] > 100) {
                  toast({
                    title: "Invalid percentage",
                    description: "The maximum percentage allowed is 100%. Value has been reset to 0.",
                    variant: "destructive",
                  })
                  handleChange("recyclingPercentage", 0)
                  setInputValues((prev) => ({ ...prev, recyclingPercentage: "0" }))
                } else {
                  handleChange("recyclingPercentage", value[0])
                  setInputValues((prev) => ({ ...prev, recyclingPercentage: value[0].toString() }))
                }
              }}
              className="flex-1"
            />
            <Input
              type="text"
              inputMode="numeric"
              value={formatDisplayValue("recyclingPercentage")}
              onChange={(e) => handleInputChange("recyclingPercentage", e.target.value)}
              className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="dark:border-gray-600 dark:text-gray-200">
          Back
        </Button>
        <Button
          onClick={onCalculate}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
        >
          Calculate Footprint
        </Button>
      </div>
    </div>
  )
}

