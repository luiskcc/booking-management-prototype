class Table < ApplicationRecord
  has_many :bookings
  validates :number, presence: true, uniqueness: true
  validates :seats, presence: true, numericality: { greater_than: 0 }

  def self.total_seats
    sum(:seats)
  end

  def self.current_occupancy
    joins(:bookings)
      .where('bookings.booking_date <= ? AND bookings.booking_date + INTERVAL \'2 hours\' >= ?', Time.current, Time.current)
      .sum(:seats)
  end

  def self.reserved_seats
    joins(:bookings)
      .where('bookings.booking_date > ? AND bookings.booking_date <= ?', 
             Time.current, 
             Time.current.end_of_day)
      .sum(:seats)
  end

  def status
    current_booking = bookings.where('booking_date <= ? AND booking_date + INTERVAL \'2 hours\' >= ?', Time.current, Time.current).first
    upcoming_booking = bookings.where('booking_date > ? AND booking_date <= ?', Time.current, Time.current.end_of_day).first

    if current_booking
      'occupied'
    elsif upcoming_booking
      'reserved'
    else
      'available'
    end
  end

  def as_json(options = {})
    super(options.merge(
      methods: [:status],
      include: {
        bookings: {
          only: [:id, :booking_date, :party_size, :client_name, :client_email, :client_phone]
        }
      }
    ))
  end
end
