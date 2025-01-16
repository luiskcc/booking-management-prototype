import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "currentDate",
    "weekView",
    "monthView",
    "weekViewContainer",
    "monthViewContainer",
    "calendarGrid",
    "timeSlot",
    "monthCell",
    "bookingsContainer",
    "monthBookingsContainer",
    "newBookingModal",
    "tableSelect",
    "clientName",
    "email",
    "phone",
    "bookingDate"
  ]

  connect() {
    this.currentDate = new Date()
    this.updateDateDisplay()
    this.loadBookings()
    this.loadTables()
  }

  async loadBookings() {
    try {
      const response = await fetch(`/?date=${this.currentDate.toISOString().split('T')[0]}&format=json`)
      const data = await response.json()
      this.displayBookings(data.week_bookings, data.month_bookings)
    } catch (error) {
      console.error('Error loading bookings:', error)
    }
  }

  async loadTables() {
    try {
      const response = await fetch('/tables.json')
      const data = await response.json()
      this.populateTableSelect(data.tables)
    } catch (error) {
      console.error('Error loading tables:', error)
    }
  }

  populateTableSelect(tables) {
    const select = this.tableSelectTarget
    select.innerHTML = '<option value="">Select a table</option>'
    tables.forEach(table => {
      const option = document.createElement('option')
      option.value = table.id
      option.textContent = `Table ${table.number} (${table.seats} seats)`
      select.appendChild(option)
    })
  }

  displayBookings(weekBookings, monthBookings) {
    // Clear existing bookings
    this.clearBookings()

    // Display week view bookings
    weekBookings.forEach(booking => {
      const date = new Date(booking.booking_date)
      const dayIndex = date.getDay()
      const hour = date.getHours()
      
      const timeSlot = this.timeSlotTargets.find(slot => 
        parseInt(slot.dataset.day) === dayIndex && 
        parseInt(slot.dataset.hour) === hour
      )

      if (timeSlot) {
        const container = timeSlot.querySelector('[data-calendar-target="bookingsContainer"]')
        container.innerHTML += this.createBookingCard(booking)
      }
    })

    // Display month view bookings
    monthBookings.forEach(booking => {
      const date = new Date(booking.booking_date)
      const day = date.getDate()
      
      const monthCell = this.monthCellTargets.find(cell => 
        parseInt(cell.dataset.day) === day
      )

      if (monthCell) {
        const container = monthCell.querySelector('[data-calendar-target="monthBookingsContainer"]')
        container.innerHTML += this.createBookingCard(booking, true)
      }
    })
  }

  clearBookings() {
    this.bookingsContainerTargets.forEach(container => container.innerHTML = '')
    this.monthBookingsContainerTargets.forEach(container => container.innerHTML = '')
  }

  createBookingCard(booking, isMonthView = false) {
    const template = document.getElementById('booking-card-template')
    const card = template.content.cloneNode(true)
    
    card.querySelector('[data-booking-name]').textContent = booking.client_name
    card.querySelector('[data-booking-table]').textContent = booking.table.number
    
    const statusElement = card.querySelector('[data-booking-status]')
    const time = new Date(booking.booking_date).toLocaleTimeString('default', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    if (isMonthView) {
      statusElement.textContent = time
    } else {
      statusElement.textContent = booking.client_name
    }

    return card.children[0].outerHTML
  }

  updateDateDisplay() {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    this.currentDateTarget.textContent = this.currentDate.toLocaleDateString('default', options)
  }

  previousPeriod() {
    if (this.weekViewContainer.classList.contains('hidden')) {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1)
    } else {
      this.currentDate.setDate(this.currentDate.getDate() - 7)
    }
    this.updateDateDisplay()
    this.loadBookings()
  }

  nextPeriod() {
    if (this.weekViewContainer.classList.contains('hidden')) {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1)
    } else {
      this.currentDate.setDate(this.currentDate.getDate() + 7)
    }
    this.updateDateDisplay()
    this.loadBookings()
  }

  today() {
    this.currentDate = new Date()
    this.updateDateDisplay()
    this.loadBookings()
  }

  switchToWeekView() {
    this.weekViewTarget.classList.add('bg-gray-100')
    this.monthViewTarget.classList.remove('bg-gray-100')
    this.weekViewContainerTarget.classList.remove('hidden')
    this.monthViewContainerTarget.classList.add('hidden')
    this.loadBookings()
  }

  switchToMonthView() {
    this.monthViewTarget.classList.add('bg-gray-100')
    this.weekViewTarget.classList.remove('bg-gray-100')
    this.monthViewContainerTarget.classList.remove('hidden')
    this.weekViewContainerTarget.classList.add('hidden')
    this.loadBookings()
  }

  showNewBookingModal(event) {
    if (event.target.dataset.hour) {
      const hour = parseInt(event.target.dataset.hour)
      const day = parseInt(event.target.dataset.day)
      const date = new Date(this.currentDate)
      date.setDate(date.getDate() - date.getDay() + day)
      date.setHours(hour, 0, 0, 0)
      this.bookingDateTarget.value = date.toISOString().slice(0, 16)
    }
    this.newBookingModalTarget.classList.remove('hidden')
  }

  hideNewBookingModal() {
    this.newBookingModalTarget.classList.add('hidden')
  }

  async createBooking(event) {
    event.preventDefault()
    const formData = {
      booking: {
        client_name: this.clientNameTarget.value,
        client_email: this.emailTarget.value,
        client_phone: this.phoneTarget.value,
        table_id: this.tableSelectTarget.value,
        booking_date: this.bookingDateTarget.value
      }
    }

    try {
      const response = await fetch('/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        this.hideNewBookingModal()
        this.loadBookings()
      } else {
        const data = await response.json()
        alert(data.error || 'Error creating booking')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Error creating booking')
    }
  }

  stopPropagation(event) {
    event.stopPropagation()
  }
} 