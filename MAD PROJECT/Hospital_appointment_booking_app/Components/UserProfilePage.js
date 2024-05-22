import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from 'react-native-elements';
import { useIsFocused } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';



const UserProfilePage = () => {
  const isFocused = useIsFocused();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [userToken, setUserToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();


  useEffect(() => {
    const fetchUserToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token || '');

      } catch (error) {
        console.error('Error fetching user token:', error);
      }
    };

    fetchUserToken();
  }, [isFocused]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/user-profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching user profile. Status: ${response.status}`);
        }

        const data = await response.json();
        setPatient(data.patient);
        setAppointments(data.appointments);
        setIsLoading(false); // Set loading to false when data is available
      } catch (error) {
        // console.error('Error fetch profile',error);
        // Handle the error as needed
        setIsLoading(false); // Set loading to false even if there's an error
      }
    };
    if (isFocused) { 
    fetchUserProfile();
    }
  }, [isFocused, userToken]); // Add userToken as a dependency

  const handleLogout = async () => {
    try {
      // Clear user token
      await AsyncStorage.removeItem('userToken');
      // navigation.navigate('Login');
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Login',
        })
      );
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoading) {
    return <Text>Loading...</Text>; // You can replace this with a loading spinner or component
  }

  return (

    
    <ScrollView style={styles.container}>
      {patient && (
          
        <View style={styles.userProfileCard}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.outer}>
            <Icon name="user-circle" type="font-awesome-5" size={25} color="#ff6347" /> 
            <Text style={styles.name}>{`${patient.PATIENT_NAME.toUpperCase()}`}</Text>
          </View>
          <View style={styles.outer}>
            <Icon name="phone-square" type="font-awesome-5" size={25} color="#ff6347" /> 
            <Text style={styles.name}>{`${patient.CONTACT_NUMBER}`}</Text>
          </View>
          
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {appointments.length > 0 && (
        <View>
          <View style={styles.outer1}>
            <Icon name="history" type="font-awesome-5" size={25} color="#ff6347" /> 
            <Text style={styles.sectionTitle}>History</Text>
          </View>
         
          {appointments.map((appointment) => (
              <View key={appointment.APPOINTMENT_ID} style={styles.appointmentCard}>
                <Text style={styles.date}>{`${new Date(appointment.DATE).toLocaleDateString()}`}</Text>
                <View style={styles.outer3}>
                  <Icon name="building" type="font-awesome-5" size={30} color="#3498db" /> 
                  <Text style={styles.name}>{`${appointment.HOSPITAL_NAME}`}</Text>
                </View>
                <View style={styles.outer3}>
                  <Icon name="user" type="font-awesome-5" size={30} color="#3498db" /> 
                  <Text style={styles.doctorname}>{`${appointment.DOCTOR_NAME}`}</Text>
                </View>
                <View style={styles.outer3}>
                  <Icon name="history" type="font-awesome-5" size={30} color="#3498db" /> 
                  <Text style={styles.status}>{`${appointment.APPOINTMENT_STATUS}`}</Text>
                </View>
              </View>
            ))}
        </View>
      )}
    </ScrollView>
 
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ADD8E6',
    padding: 20,
  },
  date:{
    textAlign:'right',
    color:'#ff6347',
  },

  userProfileCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 20,
    borderRadius: 4,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    display:'flex',
    gap:7,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    padding: 15,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    display:'flex',
    gap:10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: 'darkblue',
    padding: 15,
    borderRadius: 4,
    marginTop: 20,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight:'bold',
  },
  outer:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    gap:20,
  },
  outer1:
  {
    display:'flex',
    flexDirection:'row',
    marginTop:20,
    gap:10,
  },
  outer3:
  {
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    gap:20
  },
  status:
  {
    color:'green',
    fontWeight:'bold',
    fontSize:16
  },
  name:{
    fontWeight:'bold',
    fontSize:20
  },
  doctorname:{
    fontWeight:'bold',
    fontSize:18,
    color:'darkblue'
  }
});

export default UserProfilePage;
