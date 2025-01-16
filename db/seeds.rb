# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Clear existing data
puts "Clearing existing data..."
Booking.destroy_all
Table.destroy_all

# Create tables
puts "Creating tables..."
tables = [
  { number: 1, seats: 2 },
  { number: 2, seats: 2 },
  { number: 3, seats: 4 },
  { number: 4, seats: 4 },
  { number: 5, seats: 6 },
  { number: 6, seats: 6 },
  { number: 7, seats: 8 },
  { number: 8, seats: 8 }
].map { |attrs| Table.create!(attrs) }

# Sample client data
clients = [
  { name: "John Smith", email: "john@example.com", phone: "555-0101" },
  { name: "Jane Doe", email: "jane@example.com", phone: "555-0102" },
  { name: "Bob Wilson", email: "bob@example.com", phone: "555-0103" },
  { name: "Alice Brown", email: "alice@example.com", phone: "555-0104" },
  { name: "Charlie Davis", email: "charlie@example.com", phone: "555-0105" },
  { name: "Lisa Anderson", email: "lisa@example.com", phone: "555-0106" },
  { name: "David Miller", email: "david@example.com", phone: "555-0107" },
  { name: "Jennifer Lee", email: "jennifer@example.com", phone: "555-0108" },
  { name: "Robert Taylor", email: "robert@example.com", phone: "555-0109" },
  { name: "Maria Garcia", email: "maria@example.com", phone: "555-0110" }
]

puts "Creating bookings..."

# Get the current date
current_date = Date.today

# Create bookings for the next 7 days
(0..6).each do |day_offset|
  date = current_date + day_offset.days
  
  # Lunch time slots (11 AM - 2 PM)
  lunch_hours = (11..14)
  # Dinner time slots (5 PM - 10 PM)
  dinner_hours = (17..22)

  # Create 2-3 lunch bookings
  lunch_hours.to_a.sample(rand(2..3)).each do |hour|
    client = clients.sample
    table = tables.sample
    
    Booking.create!(
      client_name: client[:name],
      client_email: client[:email],
      client_phone: client[:phone],
      booking_date: date.to_datetime.change(hour: hour),
      party_size: rand(1..table.seats),
      table: table
    )
  end

  # Create 3-5 dinner bookings
  dinner_hours.to_a.sample(rand(3..5)).each do |hour|
    client = clients.sample
    table = tables.sample
    
    Booking.create!(
      client_name: client[:name],
      client_email: client[:email],
      client_phone: client[:phone],
      booking_date: date.to_datetime.change(hour: hour),
      party_size: rand(1..table.seats),
      table: table
    )
  end
end

puts "Seed data created successfully!"
puts "Created #{Table.count} tables"
puts "Created #{Booking.count} bookings"
