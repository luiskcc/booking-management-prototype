class Booking < ApplicationRecord
  belongs_to :table
  
  validates :client_name, presence: true
  validates :client_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :client_phone, presence: true
  validates :booking_date, presence: true
  validates :party_size, presence: true, numericality: { greater_than: 0 }
  
  def as_json(options = {})
    super(options.merge(
      methods: [:client_name, :client_email, :client_phone],
      except: [:created_at, :updated_at]
    ))
  end
end
