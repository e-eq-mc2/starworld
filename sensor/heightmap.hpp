#pragma once

#include <librealsense2/rs.hpp> // Include RealSense Cross Platform API

//https://dev.intelrealsense.com/docs/code-samples

// Each depth camera might have different units for depth pixels, so we get it here
// Using the pipeline's profile, we can retrieve the device that the pipeline uses

float get_depth_scale(rs2::device dev)
{
    // Go over the device's sensors
    for (rs2::sensor& sensor : dev.query_sensors())
    {
        // Check if the sensor if a depth sensor
        if (rs2::depth_sensor dpt = sensor.as<rs2::depth_sensor>())
        {
            return dpt.get_depth_scale();
        }
    }
    throw std::runtime_error("Device does not have a depth sensor");
}


void build_heightmap(std::vector<int> &heightmap, const rs2::depth_frame& depth_frame, float depth_scale)
{
    const int width = depth_frame.get_width();
    const int height = depth_frame.get_height();

    heightmap.resize(width);
    std::fill(heightmap.begin(), heightmap.end(), 0);

    const uint16_t* p_depth_frame = reinterpret_cast<const uint16_t*>(depth_frame.get_data());
    #pragma omp parallel for schedule(dynamic) //Using OpenMP to try to parallelise the loop
    for (int y = 0; y < height; y++)
    {
        auto depth_pixel_index = y * width;
        for (int x = 0; x < width; x++, ++depth_pixel_index)
        {
            // Get the depth value of the current pixel
            const auto pixels_distance = depth_scale * p_depth_frame[depth_pixel_index];

            // Check if the depth value is invalid (<=0) or greater than the threashold
            if (pixels_distance <= 0.f) continue;

            if ( heightmap[x] == 0 ) heightmap[x] = height - 1 - y;
        }
    }
}
