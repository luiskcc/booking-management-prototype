class BookingsController < ApplicationController
  def index
    @bookings = Booking.includes(:table)
                      .where('booking_date >= ?', Time.current.beginning_of_month)
                      .where('booking_date <= ?', Time.current.end_of_month)
                      .order(booking_date: :asc)

    respond_to do |format|
      format.html
      format.json { render json: @bookings.as_json(include: :table) }
    end
  end

  def create
    @booking = Booking.new(booking_params)

    if @booking.save
      respond_to do |format|
        format.html { redirect_to root_path, notice: 'Booking was successfully created.' }
        format.json { render json: @booking, status: :created }
      end
    else
      respond_to do |format|
        format.html { render :new }
        format.json { render json: @booking.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @booking = Booking.find(params[:id])

    if @booking.update(booking_params)
      respond_to do |format|
        format.html { redirect_to root_path, notice: 'Booking was successfully updated.' }
        format.json { render json: @booking }
      end
    else
      respond_to do |format|
        format.html { render :edit }
        format.json { render json: @booking.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @booking = Booking.find(params[:id])
    @booking.destroy

    respond_to do |format|
      format.html { redirect_to root_path, notice: 'Booking was successfully cancelled.' }
      format.json { head :no_content }
    end
  end

  private

  def booking_params
    params.require(:booking).permit(:table_id, :client_name, :email, :phone, :booking_date)
  end
end
