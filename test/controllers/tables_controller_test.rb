require "test_helper"

class TablesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get tables_index_url
    assert_response :success
  end

  test "should get show" do
    get tables_show_url
    assert_response :success
  end
end
