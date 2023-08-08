/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
// Image contour Extraction

import React, { useState } from 'react';
import { View, Button, Image } from 'react-native'; // Import the 'Image' component
import ImagePicker from 'react-native-image-picker';
import { Surface } from 'react-native-skia';
import { NativeModules } from 'react-native';

const { MainApplication } = NativeModules;

const ImageContourExtraction = () => {
  const [imageUri, setImageUri] = useState(null);

  const pickImage = () => {
    // Set the imagePath to the location of your "original.jpeg" image
    const imagePath = '../original.jpeg';

    // Update the state with the image path
    setImageUri(`file://${imagePath}`);
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


