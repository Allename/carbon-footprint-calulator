import { ThemeToggle } from "@/components/theme-toggle"
import CarbonCalculator from "@/components/carbon-calculator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Carbon Footprint Calculator
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Measure your environmental impact and discover ways to reduce it
          </p>
        </header>
        <CarbonCalculator />
      </div>
    </main>
  )
}

