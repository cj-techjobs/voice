import React, { useState, useEffect } from 'react';
import { Svg, Line, Polyline } from 'react-native-svg';
import { Dimensions, Text, View, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');

const chartWidth = width / 1.2; // Padding for margins
const chartHeight = height / 5;

const PitchVisualization = ({ data, isRecording, metering, isUploaded }) => {
  const [dataPoints, setDataPoints] = useState([]);
  const maxPitch = Math.max(...data, 100);

  useEffect(() => {
    const updateDataPoints = () => {
      setDataPoints((prevPoints) => {
        const newPoints = [...prevPoints, metering];
        if (newPoints.length > maxPitch) {
          newPoints.shift(); // Remove the first element to keep the array length fixed
        }
        return newPoints;
      });
    };

    if (isRecording) {
      updateDataPoints();
    }

  }, [metering, isUploaded]);

  const points = dataPoints
    .map((point, index) => {
      const x = (chartWidth / maxPitch) * index;
      const y = chartHeight - (chartHeight * (point / 100)); // Normalizing the metering value
      return  `${x},${y}`;
    })
    .join(' ');


  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "column", justifyContent: "space-between", }}>

        {[75, 50, 25, 0].map((value) => {
          const y = chartHeight - (value / 100) * chartHeight;
          return (
            <View>
              <Line
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="lightgray"
                strokeWidth="1"
              />
              <Text style={{ textAlign: "center", fontSize: 16 }}>
                {value}
              </Text>
            </View>);
        })}
      </View>

      <Svg height={chartHeight} width={chartWidth} style={styles.svg}>
        <Polyline
          points={isUploaded?null:points}
          fill="none"
          stroke="white"
          strokeWidth="30"
        />
        {/* X Axis */}
        <Line
          x1="0"
          y1={chartHeight}
          x2={chartWidth}
          y2={chartHeight}
          stroke="gray"
          strokeWidth="1"
        />
        {/* Y Axis */}
        <Line
          x1="0"
          y1="0"
          x2="0"
          y2={chartHeight}
          stroke="gray"
          strokeWidth="1"
        />
        {/* Labels for Y Axis */}

      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 15, flexDirection: "row"
  },
  svg: {
    borderWidth: 1,
    borderColor: 'black', marginLeft: 5
  },
});

export default PitchVisualization;
