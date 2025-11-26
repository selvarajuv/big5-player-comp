"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RangeSliderProps {
  min: number
  max: number
  value: [number, number]
  onValueChange: (value: [number, number]) => void
  step?: number
  className?: string
}

export function RangeSlider({ min, max, value, onValueChange, step = 1, className }: RangeSliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState<"start" | "end" | null>(null)

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100

  const handleMouseDown = (handle: "start" | "end") => (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(handle)
  }

  const handleMove = React.useCallback(
    (clientX: number) => {
      if (!dragging || !trackRef.current) return

      const rect = trackRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
      const rawValue = min + (percentage / 100) * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))

      if (dragging === "start") {
        const newStart = Math.min(clampedValue, value[1] - step)
        onValueChange([newStart, value[1]])
      } else {
        const newEnd = Math.max(clampedValue, value[0] + step)
        onValueChange([value[0], newEnd])
      }
    },
    [dragging, min, max, step, value, onValueChange],
  )

  React.useEffect(() => {
    if (!dragging) return

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX)
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX)
    const handleUp = () => setDragging(null)

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleUp)
    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleUp)
    }
  }, [dragging, handleMove])

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <div ref={trackRef} className="relative w-full h-2 bg-zinc-700 rounded-full cursor-pointer">
        {/* Active range highlight */}
        <div
          className="absolute h-full bg-emerald-500 rounded-full"
          style={{
            left: `${getPercentage(value[0])}%`,
            width: `${getPercentage(value[1]) - getPercentage(value[0])}%`,
          }}
        />
        {/* Start handle */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-md cursor-grab border-2 border-emerald-500 hover:scale-110 transition-transform",
            dragging === "start" && "cursor-grabbing scale-110",
          )}
          style={{ left: `${getPercentage(value[0])}%` }}
          onMouseDown={handleMouseDown("start")}
          onTouchStart={() => setDragging("start")}
        />
        {/* End handle */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-md cursor-grab border-2 border-emerald-500 hover:scale-110 transition-transform",
            dragging === "end" && "cursor-grabbing scale-110",
          )}
          style={{ left: `${getPercentage(value[1])}%` }}
          onMouseDown={handleMouseDown("end")}
          onTouchStart={() => setDragging("end")}
        />
      </div>
    </div>
  )
}
