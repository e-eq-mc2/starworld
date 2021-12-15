#include <nan.h>
#include <iostream>
#include <string>
#include <chrono>
#include <thread>

#include <librealsense2/rs.hpp> // Include RealSense Cross Platform API

// https://github.com/nlohmann/json
// wget https://github.com/nlohmann/json/releases/download/v3.10.4/json.hpp
#include "json.hpp"  

#include "filter.hpp"  
#include "heightmap.hpp"  

using namespace std;
using namespace Nan;
using namespace v8;
using json = nlohmann::json;

class SensorProgressWorker : public AsyncProgressWorker {
  public:
    SensorProgressWorker(Callback * callback, Callback * progress) 
      : AsyncProgressWorker(callback), progress(progress) { 
    }

    // Executes in worker thread
    void Execute(const AsyncProgressWorker::ExecutionProgress& progress) {
      // Create a Pipeline - this serves as a top-level API for streaming and processing frames
      rs2::pipeline pipe;
      rs2::config cfg;

      // Use a configuration object to request only depth from the pipeline
      cfg.enable_stream(RS2_STREAM_DEPTH, 640, 0, RS2_FORMAT_Z16, 30);

      // Configure and start the pipeline
      rs2::pipeline_profile profile = pipe.start(cfg);
      const float depth_scale = get_depth_scale(profile.get_device());

      Filterset filterset;

      std::vector<int> heightmap;
      json sample;

      while (true)
      {
        // Block program until frames arrive
        rs2::frameset frames = pipe.wait_for_frames();

        rs2::depth_frame depth_frame = frames.get_depth_frame(); //Take the depth frame from the frameset

        rs2::frame filtered = depth_frame; // Does not copy the frame, only adds a reference

        filterset.thr_filter.set_option(RS2_OPTION_MIN_DISTANCE, Filterset::min_distance);
        filterset.thr_filter.set_option(RS2_OPTION_MAX_DISTANCE, Filterset::max_distance);

        filterset.process(filtered);

        // Get the depth frame's dimensions
        auto width  = filtered.as<rs2::depth_frame>().get_width();
        auto height = filtered.as<rs2::depth_frame>().get_height();

        build_heightmap(heightmap, filtered, depth_scale);

        sample["width"    ] = width;
        sample["height"   ] = height;
        sample["heightmap"] = heightmap;
        const std::string dump = sample.dump();

        progress.Send(reinterpret_cast<const char *>(dump.c_str()), dump.length() + 1);

        // Print the distance
        //std::cout << "The camera is facing an object " << dist_to_center << " meters away \r";
        //std::cout << "@c++ min_distance:" << Filterset::min_distance << endl;
        //std::cout << "@c++ max_distance:" << Filterset::max_distance << endl;
        //std::this_thread::sleep_for(chrono::milliseconds(100));
      }

    }

    // Executes in event loop
    void HandleOKCallback () {
      Local<Value> argv[] = { New<v8::Number>(0) };
      Nan::Call(*callback, Nan::GetCurrentContext()->Global(), 1, argv); 
    }

    void HandleProgressCallback(const char *data, size_t size) {
      // Required, this is not created automatically 
      Nan::HandleScope scope; 

      Local<Value> argv[] = {
        New<v8::String>(data).ToLocalChecked(),
      };
      Nan::Call(*progress, Nan::GetCurrentContext()->Global(), 1, argv); 
    }

  private:
    Callback *progress;
};

NAN_METHOD(SetDistanceRange) {
  float min_d = To<double>(info[0]).FromJust();
  float max_d = To<double>(info[1]).FromJust();

  Filterset::set_distance_range(min_d, max_d);

  std::cout << "sensor: " << Filterset::min_distance << "," << Filterset::max_distance;
}

NAN_METHOD(UpdateDistanceRange) {
  float dmin_d = To<double>(info[0]).FromJust();
  float dmax_d = To<double>(info[1]).FromJust();

  Filterset::update_distance_range(dmin_d, dmax_d);

  std::cout << "sensor: " << Filterset::min_distance << "," << Filterset::max_distance;
}

NAN_METHOD(GetMinDistance) {
  Local<Number> retval = Nan::New(Filterset::min_distance);
  info.GetReturnValue().Set(retval); 
}

NAN_METHOD(GetMaxDistance) {
  Local<Number> retval = Nan::New(Filterset::max_distance);
  info.GetReturnValue().Set(retval); 
}

NAN_METHOD(Start) {
  //float min_d = To<double>(info[0]).FromJust();
  //float max_d = To<double>(info[1]).FromJust();

  Callback *callback = new Callback(info[2].As<Function>());
  Callback *progress = new Callback(info[3].As<v8::Function>());

  AsyncQueueWorker(new SensorProgressWorker(callback, progress));
}

NAN_MODULE_INIT(Init) {
  Nan::Set(target, New<String>("start").ToLocalChecked(),
      GetFunction(New<FunctionTemplate>(Start)).ToLocalChecked());

  Nan::Set(target, New<String>("get_min_distance").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(GetMinDistance)).ToLocalChecked());

  Nan::Set(target, New<String>("get_max_distance").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(GetMaxDistance)).ToLocalChecked());

  Nan::Set(target, New<String>("set_distance_range").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(SetDistanceRange)).ToLocalChecked());

  Nan::Set(target, New<String>("update_distance_range").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(UpdateDistanceRange)).ToLocalChecked());

}

NODE_MODULE(sensor, Init)
