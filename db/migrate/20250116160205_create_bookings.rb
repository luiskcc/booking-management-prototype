class CreateBookings < ActiveRecord::Migration[7.1]
  def change
    create_table :bookings do |t|
      t.references :table, null: false, foreign_key: true
      t.string :client_name
      t.string :email
      t.string :phone
      t.datetime :booking_date

      t.timestamps
    end
  end
end
