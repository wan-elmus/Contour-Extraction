/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
// Image contour Extraction

import React, { useState } from 'react';
import { View, Button, Image } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { Surface } from 'react-native-skia';
import { NativeModules } from 'react-native';

const { MainApplication } = NativeModules;

const ImageContourExtraction = () => {
  const [imageUri, setImageUri] = useState(null);

  const pickImage = () => {
    // Configure options for the ImagePicker
    const options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    // Show the ImagePicker
    ImagePicker.showImagePicker(options, response => {
      if (response.uri) {
        // Set the selected image URI to the state
        setImageUri(response.uri);
      }
    });
  };

  const extractContours = async () => {
    if (imageUri) {
      try {
        const contourData = await MainApplication.extractContours(imageUri);
        console.log('Contour Data:', contourData);
      } catch (error) {
        console.error('Contour Extraction Error:', error);
      }
    } else {
      console.log('Please pick an image first.');
    }
  };

  return (
    <View>
      <Button title="Pick Image" onPress={pickImage} />
      <Button title="Extract Contours" onPress={extractContours} />
      {imageUri && (
        <Surface width={300} height={300}>
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: '100%' }}
          />
        </Surface>
      )}
    </View>
  );
};

export default ImageContourExtraction;


