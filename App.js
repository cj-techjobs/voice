import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/screens/HomeScreen';
import Recodings from './src/screens/RecodingList';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons
import CustomHeader from './src/screens/CustomHeader';
import { StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import ProfileScreen from './src/screens/Profile';
import BarSegment from './src/screens/BarSegment';
import SegListenOrLearn from './src/screens/SegListenOrLearn';

const Stack = createStackNavigator();
function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{
          headerShown: false, // Hides header for all screens
        }} initialRouteName="Recodings">
          <Stack.Screen name="Recodings" component={Recodings} />
          <Stack.Screen name="BarSegment" component={BarSegment} />
          <Stack.Screen name="SegListenOrLearn" component={SegListenOrLearn} />

        </Stack.Navigator>
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
});


// const Tab = createBottomTabNavigator();
// function App() {
//   return (
//     <NavigationContainer>
//       <Tab.Navigator
//         screenOptions={({ route }) => ({
//           tabBarIcon: ({ focused, color, size }) => {
//             let iconName;

//             if (route.name === 'Home') {
//               iconName = focused ? 'home' : 'home-outline';
//               return <Image tintColor={"white"} style={{height:22, width:22}} source={require('./src/images/home.png')} />

//             } else if (route.name === 'Recodings') {
//               iconName = focused ? 'Recodings' : 'Recodings-outline';
//               return <Image tintColor={"white"} style={{height:22, width:22}} source={require('./src/images/recButton.png')} />
//             }
//             else if (route.name === 'Profile') {
//               iconName = focused ? 'Profile' : 'Profile-outline';
//               return <Image tintColor={"white"} style={{height:22, width:22}} source={require('./src/images/user.png')} />
//             }

//           },
//           header: ({ scene, previous, navigation }) => (
//             <CustomHeader
//               title={scene.descriptor.options.title || 'Default Title'}
//               navigation={navigation}
//             />
//           ),
//           tabBarActiveTintColor: 'tomato',
//           tabBarInactiveTintColor: 'white',
//           tabBarLabelStyle:{fontSize:15,fontWeight:"500"},

//           tabBarStyle: { paddingBottom: 5,borderTopWidth:0.2,borderColor:'#3d292b',elevation:1, height: 70, paddingTop: 5, backgroundColor: "#160103" }, // Customize tab bar style
//         })}
//       >
//         <Tab.Screen name="Home" component={HomeScreen} options={{
//           header: () => <CustomHeader title="Home" />,
//         }} />
//         <Tab.Screen name="Recodings" component={Recodings} options={{
//           header: () => <CustomHeader title="Recodings" />,
//         }} />

//          <Tab.Screen name="Profile" component={ProfileScreen} options={{
//           header: () => <CustomHeader title="Profile" />,
//         }} />
//       </Tab.Navigator>
//     </NavigationContainer>
//   );
// }

export default App;