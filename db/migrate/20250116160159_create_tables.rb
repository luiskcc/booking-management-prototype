class CreateTables < ActiveRecord::Migration[7.1]
  def change
    create_table :tables do |t|
      t.integer :number
      t.integer :seats
      t.string :status

      t.timestamps
    end
  end
end
