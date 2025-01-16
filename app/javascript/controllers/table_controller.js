import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "currentDate",
    "detailsModal",
    "modalContent",
    "currentBooking",
    "nextBooking",
    "occupancyCount",
    "occupancyBar",
    "availableSeats",
    "occupiedSeats",
    "reservedSeats"
  ]

  static values = {
    maxCapacity: { type: Number, default: 300 }
  }

  connect() {
    this.currentDate = new Date()
    this.updateDateDisplay()
    this.loadAllTableBookings()
    this.updateOccupancy()
  }

  updateDateDisplay() {
    this.currentDateTarget.textContent = this.currentDate.toLocaleDateString('default', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  previousDay() {
    this.currentDate.setDate(this.currentDate.getDate() - 1)
    this.updateDateDisplay()
    this.loadAllTableBookings()
  }

  nextDay() {
    this.currentDate.setDate(this.currentDate.getDate() + 1)
    this.updateDateDisplay()
    this.loadAllTableBookings()
  }

  today() {
    this.currentDate = new Date()
    this.updateDateDisplay()
    this.loadAllTableBookings()
  }

  async loadAllTableBookings() {
    const tables = document.querySelectorAll('[data-table-id]')
    for (const table of tables) {
      const tableId = table.dataset.tableId
      await this.loadTableBookings(tableId)
    }
    this.updateOccupancy()
  }

  async loadTableBookings(tableId) {
    try {
      const response = await fetch(`/tables/${tableId}.json`)
      const data = await response.json()
      this.updateTableCard(tableId, data.bookings)
    } catch (error) {
      console.error('Error loading table bookings:', error)
    }
  }

  updateTableCard(tableId, bookings) {
    const currentBookingContainer = document.querySelector(`[data-table-target="currentBooking-${tableId}"]`)
    const nextBookingContainer = document.querySelector(`[data-table-target="nextBooking-${tableId}"]`)

    // Find current booking
    const currentBooking = this.findCurrentBooking(bookings)
    if (currentBooking) {
      currentBookingContainer.innerHTML = this.createBookingCard(currentBooking, true)
    } else {
      currentBookingContainer.innerHTML = '<p class="text-gray-500 text-sm">No current booking</p>'
    }

    // Find next booking
    const nextBooking = this.findNextBooking(bookings)
    if (nextBooking) {
      nextBookingContainer.innerHTML = this.createBookingCard(nextBooking, true)
    } else {
      nextBookingContainer.innerHTML = '<p class="text-gray-500 text-sm">No upcoming bookings</p>'
    }
  }

  findCurrentBooking(bookings) {
    const now = this.currentDate
    return bookings.find(booking => {
      const bookingDate = new Date(booking.booking_date)
      return bookingDate.toDateString() === now.toDateString() &&
             bookingDate.getHours() <= now.getHours() &&
             bookingDate.getHours() + 2 > now.getHours() // Assuming 2-hour booking slots
    })
  }

  findNextBooking(bookings) {
    const now = this.currentDate
    return bookings.find(booking => {
      const bookingDate = new Date(booking.booking_date)
      return bookingDate > now
    })
  }

  showTableDetails(event) {
    const tableId = event.currentTarget.dataset.tableId
    this.loadTableDetailsModal(tableId)
    this.detailsModalTarget.classList.remove('hidden')
  }

  hideTableDetails() {
    this.detailsModalTarget.classList.add('hidden')
  }

  async loadTableDetailsModal(tableId) {
    try {
      const response = await fetch(`/tables/${tableId}.json`)
      const data = await response.json()
      this.displayTableDetailsModal(data.table, data.bookings)
    } catch (error) {
      console.error('Error loading table details:', error)
    }
  }

  displayTableDetailsModal(table, bookings) {
    const modalContent = `
      <div class="space-y-6">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-xl font-semibold leading-6 text-gray-900">
              Table ${table.number} Details
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              ${table.seats} seats - ${table.status.charAt(0).toUpperCase() + table.status.slice(1)}
            </p>
          </div>
          <button type="button"
                  class="rounded-md bg-white text-gray-400 hover:text-gray-500"
                  data-action="click->table#hideTableDetails">
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-2">Today's Bookings</h4>
          <div class="space-y-2">
            ${this.renderBookingsList(bookings.filter(b => 
              new Date(b.booking_date).toDateString() === this.currentDate.toDateString()
            ))}
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-2">Upcoming Bookings</h4>
          <div class="space-y-2">
            ${this.renderBookingsList(bookings.filter(b => 
              new Date(b.booking_date) > this.currentDate
            ).slice(0, 5))}
          </div>
        </div>
      </div>
    `
    this.modalContentTarget.innerHTML = modalContent
  }

  renderBookingsList(bookings) {
    if (bookings.length === 0) {
      return '<p class="text-sm text-gray-500">No bookings</p>'
    }
    return bookings.map(booking => this.createBookingCard(booking)).join('')
  }

  createBookingCard(booking, compact = false) {
    const date = new Date(booking.booking_date)
    const styles = this.getStatusStyles(booking.status)
    
    return `
      <div class="bg-white border rounded p-3 ${compact ? 'text-sm' : ''}">
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center gap-2">
              <div class="font-medium">${booking.client_name}</div>
              <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${styles.text} ${styles.bg} ${styles.ring}">
                ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            <div class="text-gray-600">${date.toLocaleString('default', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}</div>
            ${compact ? '' : `<div class="text-gray-600">${booking.phone}</div>`}
          </div>
          ${compact ? '' : `
            <div class="flex space-x-2">
              <button class="text-blue-600 hover:text-blue-800 text-sm font-medium" data-action="click->table#editBooking">
                Edit
              </button>
              <button class="text-red-600 hover:text-red-800 text-sm font-medium" data-action="click->table#cancelBooking">
                Cancel
              </button>
            </div>
          `}
        </div>
      </div>
    `
  }

  getStatusStyles(status) {
    const styles = {
      confirmed: {
        text: 'text-green-700',
        bg: 'bg-green-50',
        ring: 'ring-green-600/20'
      },
      pending: {
        text: 'text-yellow-700',
        bg: 'bg-yellow-50',
        ring: 'ring-yellow-600/20'
      },
      default: {
        text: 'text-gray-700',
        bg: 'bg-gray-50',
        ring: 'ring-gray-600/20'
      }
    }
    return styles[status] || styles.default
  }

  editBooking(event) {
    // Implement edit booking functionality
    console.log('Edit booking clicked')
  }

  cancelBooking(event) {
    // Implement cancel booking functionality
    console.log('Cancel booking clicked')
  }

  stopPropagation(event) {
    event.stopPropagation()
  }

  updateOccupancy() {
    let available = 0
    let occupied = 0
    let reserved = 0
    let totalSeats = 0

    document.querySelectorAll('[data-table-id]').forEach(tableElement => {
      const seats = parseInt(tableElement.dataset.seats) || 0
      totalSeats += seats

      const statusElement = tableElement.querySelector('.rounded-full')
      if (statusElement.classList.contains('bg-green-100')) {
        available += seats
      } else if (statusElement.classList.contains('bg-red-100')) {
        occupied += seats
      } else if (statusElement.classList.contains('bg-yellow-100')) {
        reserved += seats
      }
    })

    // Update counters
    this.availableSeatsTarget.textContent = available
    this.occupiedSeatsTarget.textContent = occupied
    this.reservedSeatsTarget.textContent = reserved

    // Calculate total occupancy
    const totalOccupied = occupied + reserved
    this.occupancyCountTarget.textContent = totalOccupied

    // Update progress bar
    const occupancyPercentage = (totalOccupied / this.maxCapacityValue) * 100
    this.occupancyBarTarget.style.width = `${Math.min(100, occupancyPercentage)}%`

    // Update progress bar color based on occupancy level
    if (occupancyPercentage >= 90) {
      this.occupancyBarTarget.classList.remove('bg-blue-600', 'bg-yellow-500')
      this.occupancyBarTarget.classList.add('bg-red-600')
    } else if (occupancyPercentage >= 70) {
      this.occupancyBarTarget.classList.remove('bg-blue-600', 'bg-red-600')
      this.occupancyBarTarget.classList.add('bg-yellow-500')
    } else {
      this.occupancyBarTarget.classList.remove('bg-yellow-500', 'bg-red-600')
      this.occupancyBarTarget.classList.add('bg-blue-600')
    }
  }
} 