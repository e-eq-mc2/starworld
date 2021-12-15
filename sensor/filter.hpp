#pragma once

#include <vector>
#include <cmath>
#include <librealsense2/rs.hpp> // Include RealSense Cross Platform API

/**
  Class to encapsulate a filter alongside its options
  */
class filter_options
{
  public:
    filter_options(const std::string name, rs2::filter& filter);
    filter_options(filter_options&& other);
    std::string filter_name;                                   //Friendly name of the filter
    rs2::filter& filter;                                       //The filter in use
    //std::map<rs2_option, filter_slider_ui> supported_options;  //maps from an option supported by the filter, to the corresponding slider
    std::atomic_bool is_enabled;                               //A boolean controlled by the user that determines whether to apply the filter or not
};

/**
  Constructor for filter_options, takes a name and a filter.
  */
filter_options::filter_options(const std::string name, rs2::filter& flt) :
  filter_name(name),
  filter(flt),
  is_enabled(true)
{
  const std::array<rs2_option, 5> possible_filter_options = {
    RS2_OPTION_FILTER_MAGNITUDE,
    RS2_OPTION_FILTER_SMOOTH_ALPHA,
    RS2_OPTION_MIN_DISTANCE,
    RS2_OPTION_MAX_DISTANCE,
    RS2_OPTION_FILTER_SMOOTH_DELTA
  };

  //Go over each filter option and create a slider for it
  for (rs2_option opt : possible_filter_options)
  {
    if (flt.supports(opt))
    {
      //rs2::option_range range = flt.get_option_range(opt);
      //supported_options[opt].range = range;
      //supported_options[opt].value = range.def;
      //supported_options[opt].is_int = filter_slider_ui::is_all_integers(range);
      //supported_options[opt].description = flt.get_option_description(opt);
      //std::string opt_name = flt.get_option_name(opt);
      //supported_options[opt].name = name + "_" + opt_name;
      //std::string prefix = "Filter ";
      //supported_options[opt].label = opt_name;
    }
  }
}

filter_options::filter_options(filter_options&& other) :
  filter_name(std::move(other.filter_name)),
  filter(other.filter),
  is_enabled(other.is_enabled.load())
{
}

class Filterset {
  public:
    static std::atomic<float> min_distance;
    static std::atomic<float> max_distance;

    static std::atomic<rs2::option_range> min_distance_range;
    static std::atomic<rs2::option_range> max_distance_range;

    static void set_distance_range(float min_d, float max_d) {
      //https://github.com/IntelRealSense/librealsense/blob/master/src/proc/threshold.cpp
      if ( min_d <  0.0 ) min_d = 0.0;
      if ( min_d > 16.0 ) min_d = 16.0;

      if ( max_d <  0.0 ) max_d = 0.0;
      if ( max_d > 16.0 ) max_d = 16.0;

      min_distance = std::round(min_d * 10.0) / 10.0;
      max_distance = std::round(max_d * 10.0) / 10.0;
    }

    static void update_distance_range(float dmin_d, float dmax_d) {
      set_distance_range(min_distance + dmin_d, max_distance + dmax_d );
    }

    // Declare filters
    rs2::decimation_filter dec_filter;  // Decimation - reduces depth frame density
    rs2::threshold_filter thr_filter;   // Threshold  - removes values outside recommended range
    rs2::spatial_filter spat_filter;    // Spatial    - edge-preserving spatial smoothing
    rs2::temporal_filter temp_filter;   // Temporal   - reduces temporal noise

    // Declare disparity transform from depth to disparity and vice versa
    const std::string disparity_filter_name;
    rs2::disparity_transform depth_to_disparity;
    rs2::disparity_transform disparity_to_depth;

    std::vector<filter_options> filters;

    Filterset() : disparity_filter_name("Disparity"), depth_to_disparity(true), disparity_to_depth(false){
      // Initialize a vector that holds filters and their options
      // The following order of emplacement will dictate the orders in which filters are applied
      filters.emplace_back("Decimate", dec_filter);
      filters.emplace_back("Threshold", thr_filter);
      filters.emplace_back(disparity_filter_name, depth_to_disparity);
      filters.emplace_back("Spatial", spat_filter);
      filters.emplace_back("Temporal", temp_filter);

      Filterset::min_distance = thr_filter.get_option(RS2_OPTION_MIN_DISTANCE);
      Filterset::max_distance = thr_filter.get_option(RS2_OPTION_MAX_DISTANCE);
    }

    void process(rs2::frame &to_be_filtered) {
      /* Apply filters.
         The implemented flow of the filters pipeline is in the following order:
         1. apply decimation filter
         2. apply threshold filter
         3. transform the scene into disparity domain
         4. apply spatial filter
         5. apply temporal filter
         6. revert the results back (if step Disparity filter was applied
         to depth domain (each post processing block is optional and can be applied independantly).
         */
      bool revert_disparity = false;
      for (auto&& filter : filters)
      {
        if (filter.is_enabled)
        {
          to_be_filtered = filter.filter.process(to_be_filtered);
          if (filter.filter_name == disparity_filter_name)
          {
            revert_disparity = true;
          }
        }
      }
      if (revert_disparity)
      {
        to_be_filtered = disparity_to_depth.process(to_be_filtered);
      }
    }

};

//https://github.com/IntelRealSense/librealsense/blob/master/src/proc/threshold.cpp
std::atomic<float> Filterset::min_distance{0.1};
std::atomic<float> Filterset::max_distance{4.0};

/*
   void render_ui(float w, float h, std::vector<filter_options>& filters)
   {
// Flags for displaying ImGui window
static const int flags = ImGuiWindowFlags_NoCollapse
| ImGuiWindowFlags_NoScrollbar
| ImGuiWindowFlags_NoSavedSettings
| ImGuiWindowFlags_NoTitleBar
| ImGuiWindowFlags_NoResize
| ImGuiWindowFlags_NoMove;

ImGui_ImplGlfw_NewFrame(1);
ImGui::SetNextWindowSize({ w, h });
ImGui::Begin("app", nullptr, flags);

// Using ImGui library to provide slide controllers for adjusting the filter options
const float offset_x = w / 4;
const int offset_from_checkbox = 120;
float offset_y = h / 2;
float elements_margin = 45;
for (auto& filter : filters)
{
// Draw a checkbox per filter to toggle if it should be applied
ImGui::SetCursorPos({ offset_x, offset_y });
ImGui::PushStyleColor(ImGuiCol_CheckMark, { 40 / 255.f, 170 / 255.f, 90 / 255.f, 1 });
bool tmp_value = filter.is_enabled;
ImGui::Checkbox(filter.filter_name.c_str(), &tmp_value);
filter.is_enabled = tmp_value;
ImGui::PopStyleColor();

if (filter.supported_options.size() == 0)
{
offset_y += elements_margin;
}
// Draw a slider for each of the filter's options
for (auto& option_slider_pair : filter.supported_options)
{
filter_slider_ui& slider = option_slider_pair.second;
if (slider.render({ offset_x + offset_from_checkbox, offset_y, w / 4 }, filter.is_enabled))
{
filter.filter.set_option(option_slider_pair.first, slider.value);
}
offset_y += elements_margin;
}
}

ImGui::End();
ImGui::Render();
}
*/
