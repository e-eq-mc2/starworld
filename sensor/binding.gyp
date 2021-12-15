{
  "targets": [
    {
      "target_name": "sensor",
      "sources": [ "sensor.cpp"], 
      "cflags": ["-std=c++11", "-Wno-ignored-qualifiers"],
      "cflags_cc": ["-std=c++11", "-Wno-ignored-qualifiers"],
      "linkflags": ["-mssse3"],
      "library_dirs": [ "/usr/local/lib"],
      "libraries": [ "librealsense2.dylib" ],
      "include_dirs" : ["<!(node -e \"require('nan')\")"],
      'conditions': [
        ['OS=="mac"', {
          'xcode_settings': {
            'MACOSX_DEPLOYMENT_TARGET': '11.0',
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
            'OTHER_CFLAGS': ["-mssse3", "-Wno-ignored-qualifiers", "-Wno-sign-compare", "-Wno-deprecated-copy"]
          }
        }]
      ]

    }
  ]
}
