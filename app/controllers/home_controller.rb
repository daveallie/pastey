class HomeController < ApplicationController
  def index
    @image_data = unless params[:code].blank?
      Net::HTTP.get(URI.parse("http://paste.ee/r/#{params[:code]}")).split('~')
    else
      []
    end.to_json
  end

  def shorten
    image_data = params[:image_data]
    if image_data.blank? || image_data.none?
      url = home_url
    else
      image_string = image_data.join('~')
      pb_url = Net::HTTP.post_form(URI.parse('http://paste.ee/api'), pasteee_options(image_string)).body
      url = home_url(pb_url.split('/').last)
    end

    render text: url, status: 200
  end

  private
  def pasteee_options(code = nil)
    {
      key: ENV['PASTEEE_API_KEY'],
      paste: code,
      expire: 0,
      format: :simple
    }
  end
end
