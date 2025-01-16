class TablesController < ApplicationController
  def index
    @tables = Table.includes(:bookings).all
    @total_seats = Table.total_seats
    @current_occupancy = Table.current_occupancy
    @reserved_seats = Table.reserved_seats
    @available_seats = @total_seats - (@current_occupancy + @reserved_seats)

    respond_to do |format|
      format.html
      format.json { render json: {
        tables: @tables,
        occupancy: {
          total: @total_seats,
          current: @current_occupancy,
          reserved: @reserved_seats,
          available: @available_seats
        }
      }}
    end
  end

  def show
    @table = Table.includes(:bookings).find(params[:id])
    render json: @table
  end

  def update
    @table = Table.find(params[:id])
    if @table.update(table_params)
      render json: @table
    else
      render json: @table.errors, status: :unprocessable_entity
    end
  end

  private

  def table_params
    params.require(:table).permit(:number, :seats, :status)
  end
end
