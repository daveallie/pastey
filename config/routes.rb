Rails.application.routes.draw do
  get '/(:code)' => 'home#index', as: :home
  post 'shorten' => 'home#shorten'
end
