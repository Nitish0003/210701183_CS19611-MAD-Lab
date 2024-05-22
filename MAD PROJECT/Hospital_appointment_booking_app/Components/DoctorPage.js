// DoctorPage.js

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-elements';

const DoctorPage = ({ route, navigation }) => {
  const { doctorsInfo } = route.params;

  const navigateToSlotPage = async (doctorId) => {
    try {
      // Get current day of the week as a string
      const currentDate = new Date();
      const dayOfWeekFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
      const currentDayOfWeekString = dayOfWeekFormatter.format(currentDate).toUpperCase();
      
      // Get current time in HH:MM format
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

const futureTime = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000);
const futureTimeString = futureTime.toLocaleTimeString('en-US', { hour12: false });

      
      console.log(doctorId);
      console.log(currentDayOfWeekString);
      console.log(currentTime);
      console.log(futureTimeString);
      
  
      // Fetch slots based on doctorId, currentDayOfWeekString, and currentTime
      const slotsResponse = await fetch(`http://10.0.2.2:5000/api/slots?doctorId=${doctorId}&dayOfWeek=${currentDayOfWeekString}&currentTime=${currentTime}&futureTime=${futureTimeString}`);
      
      if (!slotsResponse.ok) {
        throw new Error(`Error fetching slots. Status: ${slotsResponse.status}`);
      }
  
      const slotsData = await slotsResponse.json();

      console.log(slotsData);
  
      // Navigate to SlotPage with doctorId, slotsData, etc.
      navigation.navigate('SlotPage', { doctorId, slotsData });
    } catch (error) {
      console.error('Error fetching slots:', error);
      // Handle the error as needed (e.g., show an error message)
    }
  };
  

  return (
    <>
      <ScrollView>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, alignSelf: 'center' }}>Doctors</Text>
          {doctorsInfo.map((innerArray, outerIndex) => (
            <React.Fragment key={outerIndex}>
              {innerArray.map((doctor, innerIndex) => (
                <TouchableOpacity key={innerIndex} onPress={() => navigateToSlotPage(doctor.DOCTOR_ID)}>
                  <Card containerStyle={{ borderRadius: 10, marginBottom: 10, shadowColor: '#90EE90', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4 }}>
                    <Text style={{ fontSize: 18, marginBottom: 5 }}>{`Doctor ${doctor.DOCTOR_ID}`}</Text>
                    <Text>{`Name: ${doctor.DOCTOR_NAME}`}</Text>
                    {/* Add more details as needed */}
                  </Card>
                </TouchableOpacity>
              ))}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

export default DoctorPage;
