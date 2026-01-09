'use client'

import { useState, useRef, useEffect } from 'react'

interface DatePickerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate))
  const containerRef = useRef<HTMLDivElement>(null)

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: Date[] = []

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(0)) // Placeholder
    }

    // Add actual days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date())
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateSelect = (date: Date) => {
    if (date.getTime() === 0) return // Skip placeholder days
    onDateChange(date)
    setIsOpen(false)
  }

  const days = getDaysInMonth(currentMonth)
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div ref={containerRef} className="date-picker-container">
      {/* Date Display Button */}
      <button
        type="button"
        className="date-picker-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select date"
        aria-expanded={isOpen}
      >
        <span className="date-picker-icon">📅</span>
        <span className="date-picker-text">{formatDate(selectedDate)}</span>
        <span className="date-picker-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Calendar Flyout */}
      {isOpen && (
        <div className="calendar-flyout">
          {/* Month/Year Header with Navigation */}
          <div className="calendar-header">
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              ◀
            </button>
            <div className="calendar-month-year">{monthYear}</div>
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              ▶
            </button>
          </div>

          {/* Day Headers */}
          <div className="calendar-days-header">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="calendar-day-name">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {days.map((day, index) => {
              const isEmpty = day.getTime() === 0
              const isSelected = !isEmpty && isSameDay(day, selectedDate)
              const isTodayDate = !isEmpty && isToday(day)

              return (
                <button
                  key={index}
                  type="button"
                  className={`calendar-day ${isEmpty ? 'empty' : ''} ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
                  onClick={() => handleDateSelect(day)}
                  disabled={isEmpty}
                  aria-label={isEmpty ? '' : formatDate(day)}
                >
                  {isEmpty ? '' : day.getDate()}
                </button>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="calendar-footer">
            <button
              type="button"
              className="calendar-today-btn"
              onClick={() => {
                const today = new Date()
                onDateChange(today)
                setCurrentMonth(today)
                setIsOpen(false)
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
