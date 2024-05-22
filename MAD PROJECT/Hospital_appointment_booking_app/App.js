import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import HospitalView from './Components/HospitalView';
import UserProfilePage from './Components/UserProfilePage';
import CurrentStatusPage from './Components/CurrentStatusPage';
import { Icon } from 'react-native-elements';
import DoctorSpecializationPage from './Components/DoctorSpecializationPage';
import { KeyboardAvoidingView, Platform } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeTabs = () => (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -100} // Adjust this value as needed
  >
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          backgroundColor: 'rgb(74, 92, 246)',
          height: 70,
        },
        tabBarActiveTintColor: '#fff',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HospitalView}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" type="font-awesome-5" size={size} color='#fff' />
          ),headerShown:false
        }}
      />
      <Tab.Screen
        name="CurrentStatus"
        component={CurrentStatusPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="flag" type="font-awesome-5" size={size} color='#fff' />
          ),
        }}
      />
      <Tab.Screen
        name="UserProfile"
        component={UserProfilePage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" type="font-awesome-5" size={size} color='#fff' />
          ),
        }}
      />
      <Tab.Screen
        name="DOCTORS"
        component={DoctorSpecializationPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="stethoscope" type="font-awesome" size={size} color='#fff' /> // Adjust the icon as per your requirement
          ),
        }}
      />
    </Tab.Navigator>
  </KeyboardAvoidingView>
);

const App = () => {
  const [isLoggedIn, setLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" headerShown={false}>
        <Stack.Screen name="Login">
          {(props) => <Login {...props} setLoggedIn={setLoggedIn} />}
        </Stack.Screen>
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;




