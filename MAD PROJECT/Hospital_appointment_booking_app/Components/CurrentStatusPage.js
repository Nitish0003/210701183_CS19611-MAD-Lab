// import React, { useState, useEffect } from 'react';
// import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Card } from 'react-native-paper';
// import { Button, Icon, useIsFocused } from 'react-native-elements';

// const CurrentStatusPage = ({ navigation }) => {
//   const isFocused = useIsFocused();
//   const [userToken, setUserToken] = useState('');
//   const [appointments, setAppointments] = useState([]);
//   const [appointmentDetails, setAppointmentDetails] = useState({});
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserToken = async () => {
//       try {
//         const token = await AsyncStorage.getItem('userToken');
//         setUserToken(token || '');
//       } catch (error) {
//         console.error('Error fetching user token:', error);
//       }
//     };

//     fetchUserToken();
//   }, [isFocused]); 

//   useEffect(() => {
//     const fetchCurrentStatusAppointments = async () => {
//       try {
//         const response = await fetch('http://10.0.2.2:5000/api/current-status', {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${userToken}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`Error fetching current status appointments. Status: ${response.status}`);
//         }

//         const data = await response.json();
//         setAppointments(data.appointments);
//         setIsLoading(false); // Set loading to false when data is available
//       } catch (error) {
//         console.error('Error fetching current status appointments:', error);
//         setIsLoading(false); // Set loading to false even if there's an error
//       }
//     };
//     if (isFocused) { // Fetch data only when the screen is focused
//       fetchCurrentStatusAppointments();
//     }
//   }, [userToken, isFocused]);

//   const handleCardPress = async (appointmentId) => {
//     try {
//       const response = await fetch(`http://10.0.2.2:5000/api/appointments/${appointmentId}/details`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${userToken}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Error fetching appointment details. Status: ${response.status}`);
//       }

//       const data = await response.json();
//       setAppointmentDetails({
//         ...appointmentDetails,
//         [appointmentId]: data.currentToken,
//       });
//     } catch (error) {
//       console.error('Error fetching appointment details:', error);
//     }
//   };

//   if (isLoading) {
//     return <Text>Loading...</Text>; 
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <View>
//         {appointments.length > 0 ? (
//           appointments.map((appointment, index) => (
//             <TouchableOpacity key={index} onPress={() => handleCardPress(appointment.APPOINTMENT_ID)}>
//               <AppointmentCard
//                 appointment={appointment}
//                 currentToken={appointmentDetails[appointment.APPOINTMENT_ID]}
//               />
//             </TouchableOpacity>
//           ))
//         ) : (
//           <Text>No current status appointments</Text>
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#ADD8E6',
//     padding: 20,
//   },
//   card: {
//     marginVertical: 10,
//     marginHorizontal: 20,
//     borderRadius: 5,
//     elevation: 3,
//   },
//   date: {
//     marginBottom: 5,
//     textAlign:'right',
//     color:'red'
//   },
//   boldText: {
//     fontWeight: 'bold',
//   },
//   outward:{
//     display:'flex',
//     flexDirection:'column',
//     gap:8,

//   },
//   outer:{
//     display:'flex',
//     flexDirection:'row',
//     alignItems:'center',
//     gap:10,
//   },
//   name:{
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   location:{
//     fontSize:16,
//     fontWeight:'normal'
//   },
//   token:{
//     alignSelf:'center',
//     fontSize:20,
//     fontWeight:'bold',
//     color:'green',
//   },
//   outer3:{
//     display:'flex',
//     flexDirection:'row',
//     alignItems:'center',
//     gap:10,
//     marginTop:10
//   }
// });

// const AppointmentCard = ({ appointment, currentToken }) => {
//   const dateObject = new Date(appointment.DATE);

//   // Format the date to display only the date part
//   const formattedDate = dateObject.toLocaleDateString();
//   return (
//     <Card style={styles.card}>
//       <Card.Content>
//         <Text style={styles.date}>{`${formattedDate}`}</Text>
//         <View style={styles.outward}>
//             <View style={styles.outer}>
//               <View style={styles.inner1}>
//               <Icon name="building" type="font-awesome-5" size={30} color="#3498db" /> 
//               </View>
//               <View style={styles.inner2}>
//                 <Text style={styles.name}>{appointment.HOSPITAL_NAME}</Text>
//               </View>
//             </View>
//             <View style={styles.outer}>
//               <View style={styles.inner1}>
//               <Icon name="user" type="font-awesome-5" size={25} color="darkblue" /> 
//               </View>
//               <View style={styles.inner2}>
//                 <Text style={styles.location}>{appointment.DOCTOR_NAME}</Text>
//               </View>
//             </View>
//           </View>

//         {currentToken && (
//           <View style={styles.outer3}>
//             <Icon name="flag" type="font-awesome-5" size={20} color="green" /> 
//                <Text style={[styles.token]}>{`CURRENT TOKEN: ${currentToken}`}</Text>
//           </View>
         
//         )}
//       </Card.Content>
//     </Card>
//   );
// };



// export default CurrentStatusPage;


import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from 'react-native-paper';
import { Icon} from 'react-native-elements';
import { useIsFocused } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';


const CurrentStatusPage = ({ navigation }) => {
 // const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [userToken, setUserToken] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

 

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
    const fetchCurrentStatusAppointments = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/current-status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching current status appointments. Status: ${response.status}`);
        }

        const data = await response.json();
        setAppointments(data.appointments);
        setIsLoading(false); // Set loading to false when data is available
      } catch (error) {
       // console.error('Error fetching current status appointments:', error);
        setIsLoading(false); // Set loading to false even if there's an error
      }
    };
   

    if (isFocused) { // Fetch data only when the screen is focused
      fetchCurrentStatusAppointments();
     
    }
   
    // Specify dependencies array
    
  }, [isFocused, userToken]);

  useEffect(() => {
    return () => {
      setSelectedAppointmentId(null);
    };
  }, [isFocused, userToken]);

  const handleCardPress = async (appointmentId) => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/appointments/${appointmentId}/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching appointment details. Status: ${response.status}`);
      }

      const data = await response.json();
   
      setAppointmentDetails({
        ...appointmentDetails,
        [appointmentId]: {
          currentToken: data.currentToken,
          statusofSlot: data.statusofSlot
        }
      });
      setSelectedAppointmentId(appointmentId); 
    } catch (error) {
     // console.error('Error fetching appointment details:', error);
    }
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }
 

  return (
        <ScrollView style={styles.container}>
          <View>
            {appointments.length > 0 ? (
              appointments.map((appointment, index) => (
                <TouchableOpacity key={index} onPress={() => handleCardPress(appointment.APPOINTMENT_ID)}>
                  <AppointmentCard
                    appointment={appointment}
                    currentToken={appointmentDetails[appointment.APPOINTMENT_ID]?.currentToken}
                    statusOfSlot={appointmentDetails[appointment.APPOINTMENT_ID]?.statusofSlot}
                    showToken={appointment.APPOINTMENT_ID === selectedAppointmentId} 
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Text>No current status appointments</Text>
            )}
          </View>
        </ScrollView>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        backgroundColor: '#ADD8E6',
        padding: 20,
      },
      card: {
        marginVertical: 10,
        marginHorizontal: 20,
        borderRadius: 5,
        elevation: 3,
      },
      date: {
        marginBottom: 5,
        textAlign:'right',
        color:'red'
      },
      boldText: {
        fontWeight: 'bold',
      },
      outward:{
        display:'flex',
        flexDirection:'column',
        gap:8,
    
      },
      outer:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        gap:10,
      },
      name:{
        fontSize: 20,
        fontWeight: 'bold',
      },
      location:{
        fontSize:16,
        fontWeight:'normal'
      },
      token:{
        alignSelf:'center',
        fontSize:20,
        fontWeight:'bold',
        color:'green',
      },
      outer3:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        gap:10,
        marginTop:10
      }
    });
    
    const AppointmentCard = ({ appointment, currentToken, showToken, statusOfSlot}) => {
      const dateObject = new Date(appointment.DATE);
    
      // Format the date to display only the date part
      const options = { weekday: 'short', day: '2-digit', month: 'short' };
  const currentDate = dateObject.toLocaleDateString('en-US', options);
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.date}>{`${currentDate}`} </Text>
      
            <View style={styles.outward}>
                <View style={styles.outer}>
                  <View style={styles.inner1}>
                  <Icon name="building" type="font-awesome-5" size={30} color="#3498db" /> 
                  </View>
                  <View style={styles.inner2}>
                    <Text style={styles.name}>{appointment.HOSPITAL_NAME}</Text>
                 
                  </View>
               
                </View>
                
                <View style={styles.outer}>
                  <View style={styles.inner1}>
                  <Icon name="user" type="font-awesome-5" size={25} color="darkblue" /> 
                  </View>
                  <View style={styles.inner2}>
                    <Text style={styles.location}>{appointment.DOCTOR_NAME}</Text>
                  </View>
                </View>
                <Text style={styles.name}>{appointment.TOKEN_NUMBER}</Text>
              </View>
    
            {currentToken && showToken && (
              <View style={styles.outer3}>
                <Icon name="flag" type="font-awesome-5" size={20} color="green" /> 
                   <Text style={[styles.token]}> 
                    {statusOfSlot === 'YET_TO_START' ? `YET TO START` : `CURRENT TOKEN: ${currentToken}`}
                   </Text>
                  
              </View>
             
            )}
          </Card.Content>
        </Card>
      );
};

export default CurrentStatusPage;
