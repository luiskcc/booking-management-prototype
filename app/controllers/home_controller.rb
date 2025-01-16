class HomeController < ApplicationController
  def index
    # Get current date
    @date = params[:date] ? Date.parse(params[:date]) : Date.today
    
    # Get all bookings for the current week
    start_of_week = @date.beginning_of_week(:sunday)
    end_of_week = @date.end_of_week(:sunday)
    @week_bookings = Booking.includes(:table)
                           .where(booking_date: start_of_week.beginning_of_day..end_of_week.end_of_day)
                           .order(:booking_date)

    # Get all bookings for the current month
    start_of_month = @date.beginning_of_month
    end_of_month = @date.end_of_month
    @month_bookings = Booking.includes(:table)
                            .where(booking_date: start_of_month.beginning_of_day..end_of_month.end_of_day)
                            .order(:booking_date)

    # Get current and upcoming bookings
    @current_bookings = Booking.includes(:table)
                              .where('booking_date <= ? AND booking_date + INTERVAL \'2 hours\' >= ?', 
                                    Time.current, Time.current)
                              .order(:booking_date)

    @upcoming_bookings = Booking.includes(:table)
                               .where('booking_date > ? AND booking_date <= ?', 
                                     Time.current, Time.current.end_of_day)
                               .order(:booking_date)
                               .limit(5)

    # Get all tables for the booking form
    @tables = Table.all.order(:number)

    respond_to do |format|
      format.html
      format.json { 
        render json: {
          week_bookings: @week_bookings,
          month_bookings: @month_bookings,
          current_bookings: @current_bookings,
          upcoming_bookings: @upcoming_bookings,
          tables: @tables
        }
      }
    end
  end

  def settings
    # We'll implement this later
  end
end
