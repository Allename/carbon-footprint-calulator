"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { FootprintResults } from "@/lib/types"
import { Download, Leaf, AlertTriangle, ThumbsUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useTheme } from "next-themes"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface ResultsVisualizationProps {
  results: FootprintResults
}

export default function ResultsVisualization({ results }: ResultsVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Ensure component is mounted to access theme
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !mounted) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Check if dark mode is active
    const isDarkMode = theme === "dark"

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Draw pie chart
    const centerX = canvasRef.current.width / 2
    const centerY = canvasRef.current.height / 2
    const radius = Math.min(centerX, centerY) - 10

    const data = [
      { label: "Transport", value: results.transportation, color: "#34d399" },
      { label: "Energy", value: results.homeEnergy, color: "#60a5fa" },
      { label: "Food", value: results.food, color: "#f97316" },
      { label: "Lifestyle", value: results.lifestyle, color: "#a78bfa" },
    ]

    const total = data.reduce((sum, item) => sum + item.value, 0)
    let startAngle = 0

    data.forEach((item) => {
      const sliceAngle = (2 * Math.PI * item.value) / total

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()

      ctx.fillStyle = item.color
      ctx.fill()

      // Draw label
      const labelAngle = startAngle + sliceAngle / 2
      const labelX = centerX + radius * 0.7 * Math.cos(labelAngle)
      const labelY = centerY + radius * 0.7 * Math.sin(labelAngle)

      // Use white text for dark mode, black for light mode
      ctx.fillStyle = isDarkMode ? "#ffffff" : "#000000"
      ctx.font = "bold 12px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(item.label, labelX, labelY)

      startAngle += sliceAngle
    })
  }, [results, theme, mounted])

  const getImpactLevel = () => {
    const total = results.total
    if (total < 5)
      return { level: "Low", color: "text-green-600 dark:text-green-400", icon: <ThumbsUp className="h-6 w-6" /> }
    if (total < 10)
      return {
        level: "Moderate",
        color: "text-yellow-600 dark:text-yellow-400",
        icon: <AlertTriangle className="h-6 w-6" />,
      }
    return { level: "High", color: "text-red-600 dark:text-red-400", icon: <AlertTriangle className="h-6 w-6" /> }
  }

  const impactLevel = getImpactLevel()

  const getRecommendations = () => {
    const recommendations = []

    if (results.transportation > 3) {
      recommendations.push("Consider carpooling, using public transportation, or switching to an electric vehicle.")
    }

    if (results.homeEnergy > 2) {
      recommendations.push(
        "Reduce energy consumption by using energy-efficient appliances and increasing renewable energy usage.",
      )
    }

    if (results.food > 2) {
      recommendations.push("Reduce meat consumption and food waste, and buy more locally sourced food.")
    }

    if (results.lifestyle > 1) {
      recommendations.push("Increase recycling efforts and reduce new purchases by reusing or repairing items.")
    }

    return recommendations
  }

  // Detect if we're on a mobile device
  const isMobile = () => {
    if (typeof window === "undefined") return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Improved download function with better mobile support
  const handleDownload = async () => {
    try {
      setIsDownloading(true)

      // Create a new canvas for the report
      const reportCanvas = document.createElement("canvas")
      reportCanvas.width = 600
      reportCanvas.height = 800
      const reportCtx = reportCanvas.getContext("2d")

      if (!reportCtx) {
        throw new Error("Could not get canvas context")
      }

      // Set background
      reportCtx.fillStyle = "#ffffff"
      reportCtx.fillRect(0, 0, reportCanvas.width, reportCanvas.height)

      // Add title
      reportCtx.fillStyle = "#333333"
      reportCtx.font = "bold 24px Arial"
      reportCtx.textAlign = "center"
      reportCtx.fillText("Your Carbon Footprint Report", reportCanvas.width / 2, 40)

      // Add date
      const date = new Date().toLocaleDateString()
      reportCtx.font = "14px Arial"
      reportCtx.fillText(date, reportCanvas.width / 2, 65)

      // Copy the pie chart - ensure it's loaded first
      if (canvasRef.current) {
        // Create a temporary image to ensure the canvas is fully rendered
        const img = new Image()
        img.crossOrigin = "anonymous"

        // Convert the canvas to a data URL
        const canvasDataUrl = canvasRef.current.toDataURL("image/png")

        // Wait for the image to load before drawing it
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = canvasDataUrl
        })

        // Now draw the loaded image onto the report canvas
        reportCtx.drawImage(img, 150, 80, 300, 300)
      }

      // Add total - centered
      reportCtx.font = "bold 18px Arial"
      reportCtx.fillText(`Total: ${results.total.toFixed(2)} tons CO₂e/year`, reportCanvas.width / 2, 410)

      // Add breakdown - centered
      reportCtx.font = "bold 16px Arial"
      reportCtx.fillText("Carbon Breakdown:", reportCanvas.width / 2, 450)

      reportCtx.font = "14px Arial"
      reportCtx.fillText(`Transportation: ${results.transportation.toFixed(2)} tons CO₂e`, reportCanvas.width / 2, 480)
      reportCtx.fillText(`Home Energy: ${results.homeEnergy.toFixed(2)} tons CO₂e`, reportCanvas.width / 2, 505)
      reportCtx.fillText(`Food: ${results.food.toFixed(2)} tons CO₂e`, reportCanvas.width / 2, 530)
      reportCtx.fillText(`Lifestyle: ${results.lifestyle.toFixed(2)} tons CO₂e`, reportCanvas.width / 2, 555)

      // Add recommendations - centered with word wrapping
      reportCtx.font = "bold 16px Arial"
      reportCtx.fillText("Recommendations:", reportCanvas.width / 2, 600)

      const recommendations = getRecommendations()
      reportCtx.font = "14px Arial"

      // Function to wrap text
      const wrapText = (text, x, y, maxWidth, lineHeight) => {
        if (!text) return 0 // Guard against undefined text

        const words = text.split(" ")
        let line = ""
        let testLine = ""
        let lineCount = 0

        for (let n = 0; n < words.length; n++) {
          testLine = line + words[n] + " "
          const metrics = reportCtx.measureText(testLine)
          const testWidth = metrics.width

          if (testWidth > maxWidth && n > 0) {
            reportCtx.fillText(line, x, y + lineCount * lineHeight)
            line = words[n] + " "
            lineCount++
          } else {
            line = testLine
          }
        }

        reportCtx.fillText(line, x, y + lineCount * lineHeight)
        return lineCount + 1
      }

      let yPosition = 625
      recommendations.forEach((recommendation, index) => {
        if (!recommendation) return // Guard against undefined recommendations

        // Add bullet point
        reportCtx.fillText("•", reportCanvas.width / 2 - 200, yPosition)
        // Wrap text with proper width
        const lineCount = wrapText(recommendation, reportCanvas.width / 2, yPosition, 380, 20)
        yPosition += lineCount * 25
      })

      // Convert to image
      const dataUrl = reportCanvas.toDataURL("image/png")

      if (isMobile()) {
        // For mobile devices, open the image in a new tab
        const newWindow = window.open("", "_blank")
        if (!newWindow) {
          throw new Error("Popup blocked. Please allow popups for this site.")
        }

        // Write the HTML content directly without using template literals
        // to avoid any potential issues with string interpolation
        newWindow.document.write("<!DOCTYPE html>")
        newWindow.document.write("<html>")
        newWindow.document.write("<head>")
        newWindow.document.write("<title>Carbon Footprint Report</title>")
        newWindow.document.write('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
        newWindow.document.write("<style>")
        newWindow.document.write(
          "body { margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; font-family: Arial, sans-serif; background-color: #f5f5f5; }",
        )
        newWindow.document.write(".container { max-width: 100%; padding: 20px; box-sizing: border-box; }")
        newWindow.document.write(
          "img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }",
        )
        newWindow.document.write(
          ".instructions { margin-top: 20px; padding: 15px; background-color: #e8f5e9; border-radius: 4px; text-align: center; }",
        )
        newWindow.document.write("h2 { color: #2e7d32; margin-top: 0; }")
        newWindow.document.write("p { margin-bottom: 0; }")
        newWindow.document.write("</style>")
        newWindow.document.write("</head>")
        newWindow.document.write("<body>")
        newWindow.document.write('<div class="container">')
        newWindow.document.write('<img src="' + dataUrl + '" alt="Carbon Footprint Report">')
        newWindow.document.write('<div class="instructions">')
        newWindow.document.write("<h2>Save Your Report</h2>")
        newWindow.document.write(
          '<p>Press and hold on the image above, then select "Save Image" or "Download Image" from the menu.</p>',
        )
        newWindow.document.write("</div>")
        newWindow.document.write("</div>")
        newWindow.document.write("</body>")
        newWindow.document.write("</html>")
        newWindow.document.close()

        toast({
          title: "Report ready",
          description: "Your report has opened in a new tab. Press and hold the image to save it.",
        })
      } else {
        // For desktop, use the direct download approach
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = "carbon-footprint-report.png"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "Report downloaded",
          description: "Your carbon footprint report has been downloaded",
        })
      }
    } catch (error) {
      console.error("Download error:", error)
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message || "There was a problem generating your report. Please try again.",
        action: (
          <ToastAction altText="Try again" onClick={handleDownload}>
            Try again
          </ToastAction>
        ),
      })
    } finally {
      setIsDownloading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 max-h-[calc(100vh-10rem)] overflow-y-auto p-2">
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
          <Leaf className="h-5 w-5 sm:h-6 sm:w-6" /> Your Carbon Footprint Results
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Based on your responses, here's an estimate of your annual carbon footprint.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 dark:text-gray-100 text-center">Carbon Breakdown</h3>
            <div className="flex justify-center">
              <canvas ref={canvasRef} width={250} height={250} className="max-w-full"></canvas>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold dark:text-gray-100 text-center">Impact Summary</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between dark:text-gray-200 text-sm sm:text-base">
                  <span>Transportation</span>
                  <span>{results.transportation.toFixed(2)} tons CO₂e</span>
                </div>
                <Progress
                  value={(results.transportation / results.total) * 100}
                  className="h-2 bg-gray-200 dark:bg-gray-700"
                  indicatorClassName="bg-green-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between dark:text-gray-200 text-sm sm:text-base">
                  <span>Home Energy</span>
                  <span>{results.homeEnergy.toFixed(2)} tons CO₂e</span>
                </div>
                <Progress
                  value={(results.homeEnergy / results.total) * 100}
                  className="h-2 bg-gray-200 dark:bg-gray-700"
                  indicatorClassName="bg-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between dark:text-gray-200 text-sm sm:text-base">
                  <span>Food</span>
                  <span>{results.food.toFixed(2)} tons CO₂e</span>
                </div>
                <Progress
                  value={(results.food / results.total) * 100}
                  className="h-2 bg-gray-200 dark:bg-gray-700"
                  indicatorClassName="bg-orange-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between dark:text-gray-200 text-sm sm:text-base">
                  <span>Lifestyle</span>
                  <span>{results.lifestyle.toFixed(2)} tons CO₂e</span>
                </div>
                <Progress
                  value={(results.lifestyle / results.total) * 100}
                  className="h-2 bg-gray-200 dark:bg-gray-700"
                  indicatorClassName="bg-purple-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t dark:border-gray-700 mt-4">
              <div className="flex justify-between items-center dark:text-gray-200 font-medium">
                <span className="text-base sm:text-lg">Total Carbon</span>
                <span className="text-lg sm:text-xl">{results.total.toFixed(2)} tons</span>
              </div>
            </div>

            <div className="mt-4 p-3 sm:p-4 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center gap-2 sm:gap-3">
              <div className={impactLevel.color}>{impactLevel.icon}</div>
              <div>
                <p className="font-medium dark:text-gray-200 text-sm sm:text-base">
                  Your impact level is <span className={`font-bold ${impactLevel.color}`}>{impactLevel.level}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  The average American produces about 16 tons CO₂e per year
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 dark:text-gray-100">
            Recommendations to Reduce Your Footprint
          </h3>
          <ul className="space-y-2 list-disc pl-5 text-sm sm:text-base">
            {getRecommendations().map((recommendation, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {recommendation}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Processing..." : "Download Report"}
        </Button>
      </div>
    </div>
  )
}

