class HomeController < ApplicationController
  def index
    @image_data = unless params[:pb_code].blank?
      Net::HTTP.get(URI.parse("http://pastebin.com/raw/#{params[:pb_code]}")).split('~')
    else
      []
    end.to_json
  end

  def shorten
    # image_data = params[:image_data]
    # if image_data.blank? || image_data.none?
    #   url = home_url
    # else
    #   image_string = image_data.join('~')
    #   pb_url = Net::HTTP.post_form(URI.parse('http://pastebin.com/api/api_post.php'), pastebin_options(image_string)).body
    #   url = home_url(pb_url.split('/').last)
    # end

    # render json: url, status: 200
    render text: home_url, status: 200
  end

  private
  def pastebin_options(code = nil)
    {
      api_option: 'paste',
      api_dev_key: ENV['PASTEBIN_API_KEY'],
      api_paste_code: code,
      api_paste_private: 1 # unlisted
    }
  end
end
