Rails.application.routes.draw do
  root 'home#index'
  
  resources :tables, only: [:index, :show]
  resources :bookings
  
  # Restaurant map route
  get 'restaurant_map', to: 'tables#index'
  
  # Settings route (we'll implement this later if needed)
  get 'settings', to: 'home#settings'
end
