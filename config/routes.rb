Rails.application.routes.draw do
  get '/(:pb_code)' => 'home#index', as: :home
  post 'shorten' => 'home#shorten'
end
