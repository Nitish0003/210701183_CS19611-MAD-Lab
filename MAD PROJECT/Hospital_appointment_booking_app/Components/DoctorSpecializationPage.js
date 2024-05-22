import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, TextInput } from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLoading } from 'expo';
// import { useFonts, FontAwesome5 } from '@expo-google-fonts/fa5';



const DoctorSpecializationPage = ({ route }) => {
  const { doctorsWithSpecialization, hospitalId, hospitalName } = route.params;
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slotsData, setSlotsData] = useState([]);
  const [userToken, setUserToken] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const options = { weekday: 'short', day: '2-digit', month: 'short' };
  const currentDate1 = new Date().toLocaleDateString('en-US', options);



  useEffect(() => {
    
    const fetchUserToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        console.log(token);
        setUserToken(token || '');
      } catch (error) {
        console.error('Error fetching user token:', error);
      }
    };

    fetchUserToken();
  }, []);

  const fetchSlotsData = async (doctorId) => {
    try {
      
      const currentDate = new Date();
      const dayOfWeekFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
      const currentDayOfWeekString = dayOfWeekFormatter.format(currentDate).toUpperCase();
      
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      const futureTime = new Date(currentDate.getTime() + 3 * 60 * 60 * 1000);
      const futureTimeString = futureTime.toLocaleTimeString('en-US', { hour12: false });

      const slotsResponse = await fetch(`http://10.0.2.2:5000/api/slots?doctorId=${doctorId}&dayOfWeek=${currentDayOfWeekString}&currentTime=${currentTime}&futureTime=${futureTimeString}`);
      

      const slotsData = await slotsResponse.json();
     
      setSlotsData(slotsData);

      if (!slotsResponse.ok) {
        throw new Error(`Error fetching slots. Status: ${slotsResponse.status}`);
      }
      
      
     
    } catch (error) {
      console.error('Error fetching slots:', error);
      // Handle the error as needed (e.g., show an error message)
    }
  };

  const handleSlotBooking = async (docSlotId, slotTime, doctorId, hospitalId) => {

    // Implement your booking logic here
    try {
       
                  const response = await fetch('http://10.0.2.2:5000/book-slot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`,  // Ensure "Bearer" is added here
            },
            body: JSON.stringify({ docSlotId, doctorId, hospitalId }),
          });
    
        if (response.ok) {
          Alert.alert(`Booking Slot ${docSlotId} at ${slotTime} successful`);
        }  else {
          // Check if the error message indicates that the slot is already booked
          const data = await response.json();
          if (data.message === 'Slot already booked') {
            Alert.alert('Slot already booked. Please choose another slot.');
          } else {
            // Display a generic error message for other errors
            Alert.alert('Error booking slot. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error booking slot:', error);
        Alert.alert('Error booking slot. Please try again.');
      }
  };

  return (
    <ScrollView>
      <View style={styles.header}>
        <Text style={styles.h_title}>Welcome to{'\n'}{hospitalName} !</Text>
        <Text style={styles.h_title1}>Find Your Doctor{'\n'}Online!</Text>
      </View>
    <ScrollView style={styles.container}>
    <View >
     
      {doctorsWithSpecialization.map((doctor, index) => (
        <View key={index}>
          <TouchableOpacity onPress={() => {
            setSelectedDoctor(doctor);
            setSelectedDoctorId(doctor.DOCTOR_ID);
            fetchSlotsData(doctor.DOCTOR_ID);
          }}>
            <Card containerStyle={styles.cardContainer}>
              <View style={styles.outward}>
                <View style={styles.outer}>
                  <Icon name="user-md" type="font-awesome-5" size={60} color="darkblue" /> 
                </View>
                <View style={styles.outer1}>
                  <Text style={styles.name}>{`${doctor.DOCTOR_NAME}`}</Text>
                    {doctor.specializations.map((specialization, specializationIndex) => (
                      
                      <Text key={specializationIndex} style={styles.spec_name}>{specialization.charAt(0).toUpperCase() + specialization.slice(1)}</Text>
                    ))}
                </View>
              </View>
              
            </Card>
          </TouchableOpacity>
          {selectedDoctor && selectedDoctor.DOCTOR_ID === doctor.DOCTOR_ID && (
            <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', padding:10, alignSelf: 'center' }}>Available Slots</Text>
            {slotsData.map((slot, slotIndex) => {
            
             const currentDate = new Date();
             const currentDayIndex = currentDate.getDay();
             const currentDayName = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][currentDayIndex];
             const slotDayName = slot.DAY_OF_WEEK; // Assuming slot.DAY_OF_WEEK contains the full day name like "SATURDAY"
             const isCurrentDay = slotDayName === currentDayName;
             const nextDay = new Date(currentDate);
             nextDay.setDate(currentDate.getDate() + 1);
             const nextDayFormatted = nextDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

              return (
                <Card key={slotIndex} containerStyle={{ borderRadius: 20, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4 }}>
                  <Text style={{ fontSize: 18, marginBottom: 5 }}>{isCurrentDay ? currentDate1 : nextDayFormatted}</Text>
                  <Text>{`Time: ${slot.OP_START_TIME}`}</Text>
                
                  <Text>{slot.DAY_OF_WEEK}</Text>
                  <Button 
                    title="Book"
                    onPress={() => handleSlotBooking(slot.DOC_SLOT_ID, slot.OP_START_TIME, selectedDoctorId, hospitalId)}
                    buttonStyle={{ marginTop: 10, backgroundColor:'orange', borderRadius:20}}
                  />
                </Card>
              );
            })}
          </View>
          )}
        </View>
      ))}
    </View>
  </ScrollView>
  </ScrollView>
  );
};

const styles= StyleSheet.create({
  header:{
    backgroundColor:'rgb(74, 92, 246)', 
    padding: 40,
    display:'flex',
    gap:30,
    borderBottomLeftRadius:30,
    borderBottomRightRadius:30,
    },
    h_title:{
      color:'#fff',
      fontSize: 26,
      fontWeight: 'bold',
      letterSpacing:1.5,
      textAlign:'left',
      
    },
    h_title1:{
      color:'#fff',
      fontSize: 26,
      letterSpacing:1.5,
      textAlign:'left',
    },
  container: {
    backgroundColor: 'rgb(237, 239, 255)',
    padding: 20,
  },
  cardContainer: {
    borderRadius: 15,
    padding:30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  outward:{
    display:'flex',
    flexDirection:'row',
    gap:50
  },
  outer:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    
  },
  name:{
    fontSize: 20,
    fontWeight: 'bold',
    color:'darkblue'
  },
  spec_name:{
    fontSize:16,
    fontWeight:'bold',
    color:'grey'
  },

})

export default DoctorSpecializationPage;
