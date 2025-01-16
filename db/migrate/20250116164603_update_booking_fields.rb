class UpdateBookingFields < ActiveRecord::Migration[7.1]
  def change
    rename_column :bookings, :email, :client_email
    rename_column :bookings, :phone, :client_phone
    add_column :bookings, :party_size, :integer
  end
end
