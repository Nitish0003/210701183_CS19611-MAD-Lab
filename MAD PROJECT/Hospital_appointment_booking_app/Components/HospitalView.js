import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image} from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native-paper';


const HospitalView = () => {
  const [hospitals, setHospitals] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch data when the component mounts
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Replace 'your-api-endpoint' with the actual endpoint to fetch hospital data
      const response = await fetch('http://10.0.2.2:5000/api/hospitals');
      const data = await response.json();
      setHospitals(data); // Update the state with the fetched data
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleHospitalClick = async (hospitalId, hospitalName) => {
    // try {
    //   // Fetch specialization data based on the hospitalId
    //   const specializationResponse = await fetch(`http://10.0.2.2:5000/api/hospital_specialization_mapping/${hospitalId}`);
    //   console.log(hospitalId);
    //   const specializationText = await specializationResponse.text();
  
    //   // Check if the response is valid JSON
    //   let specializationData;

    // try {
    //   specializationData = JSON.parse(specializationText);
    // } catch (jsonError) {
    //   console.error('Error parsing JSON:', jsonError);

    //   // Handle specific error conditions
    //   if (specializationResponse.status === 404) {
    //     console.error('Hospital specialization mapping not found.');
    //     throw new Error('Hospital specialization mapping not found.');
    //   } else {
    //     console.log("error");
    //   }
    // }
    //   // Extract specialization IDs from the mapping data
    //   const specializationIds = specializationData.map(item => item.SPECIALIZATION_ID);
  
    //   // Fetch specialization names based on the specialization IDs
    //   const specializationNamesResponse = await fetch(`http://10.0.2.2:5000/api/specializations?ids=${specializationIds.join(',')}`);
  
    //   if (!specializationNamesResponse.ok) {
    //     throw new Error(`Error fetching specialization names. Status: ${specializationNamesResponse.status}`);
    //   }
  
    //   const specializationNamesData = await specializationNamesResponse.json();
    //   console.log(specializationNamesData);
  
    //   // Extract specialization names
    //   const specializationNames = specializationNamesData.map(item => item.SPECIALIZATION);
    //   const specializationid = specializationNamesData.map(item=>item.SPECIALIZATION_ID);
     
    //   // Navigate to the specialization page with the data
    //   navigation.navigate('SpecializationPage', { specializationNames, specializationid, hospitalId });
    // } catch (error) {
    //   console.error('Error fetching specialization data:', error);
    // }

    try {
      // Fetch doctors based on the selected hospitalId
      const doctorResponse = await fetch(`http://10.0.2.2:5000/api/doctors/${hospitalId}`);
      const doctorData = await doctorResponse.json();

      // Map over the doctors to fetch specialization information for each
      const doctorsWithSpecializationPromises = doctorData.map(async (doctor) => {
        // Fetch specialization IDs for each doctor
        const specializationResponse = await fetch(`http://10.0.2.2:5000/api/doctor_specialization_mapping/${doctor.DOCTOR_ID}`);
        const specializationData = await specializationResponse.json();

        // Map over the specialization IDs to fetch specialization names
        const specializationNamesPromises = specializationData.map(async (specializationId) => {
          const specializationNameResponse = await fetch(`http://10.0.2.2:5000/api/specializations?ids=${specializationId}`);
          const specializationNameData = await specializationNameResponse.json();

          // Return the specialization name
          return specializationNameData[0].SPECIALIZATION; // Assuming there is only one specialization per ID
        });

        // Wait for all specialization names to be fetched
        const specializationNames = await Promise.all(specializationNamesPromises);

        // Add the specialization names to the doctor object
        return {
          ...doctor,
          specializations: specializationNames,
        };
      });

      // Wait for all doctors with specialization information to be fetched
      const doctorsWithSpecialization = await Promise.all(doctorsWithSpecializationPromises);

      // Navigate to the DoctorSpecializationPage with the fetched data
      navigation.navigate('DOCTORS', { doctorsWithSpecialization, hospitalId , hospitalName});
    } catch (error) {
      console.error('Error handling hospital click:', error);
    }

  };



  

  return (
    <ScrollView>
    <View style={styles.header}>
        <Text style={styles.h_title}>Choose{'\n'}Your Hospital !</Text>
        
        <View style={styles.inputcontainer}>
          <Icon name="magnifying-glass" type="entypo" size={30} color="grey" style={styles.icon}/> 
          <TextInput style={styles.h_input} placeholder='Search Hospital'></TextInput>
        </View>
        
      </View>
    <ScrollView style={styles.container}>
      
    {hospitals.map((item) => (
      <TouchableOpacity key={item.HOSPITAL_ID} onPress={() => handleHospitalClick(item.HOSPITAL_ID, item.HOSPITAL_NAME)}>
        <View>
        <Card containerStyle={styles.card}>
          <View style={styles.outer}>
            <View >
              <Image source={require('../assets/hospital.png')} style={styles.image}/>
            </View>
           
            <View style={styles.textContainer}>
              <Text style={styles.name} numberOfLines={1}>{item.HOSPITAL_NAME}</Text>
              <View style={styles.locationcontainer}>
                <Icon name="location-pin" type="entypo" size={20} color="#e74c3c" /> 
                <Text style={styles.location}>{item.ADDRESS}</Text>
              </View>
            </View>
           
          </View>
        </Card>
        </View>
      </TouchableOpacity>
    ))}
  </ScrollView>
  </ScrollView>
);
};

const styles = StyleSheet.create({
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
    inputcontainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    
      backgroundColor:'rgb(237, 239, 255)',
  // borderRadius:30,
      borderWidth: 1, // You can remove this if you don't need a border
      borderColor: 'grey', // You can remove this if you don't need a border
    },
    icon: {
      marginLeft: 10,
      marginRight: 5,
      
    },
    h_input:{
      backgroundColor: 'rgb(237, 239, 255)',
      flex:1,
      color:'blue',
    },
   
container: {
  backgroundColor: 'rgb(237, 239, 255)',
  padding: 20,

},
card:{
   borderRadius:10,
   padding:30,
},
outer:{
  display:'flex',
  flexDirection:'row',
  alignItems:'center',
  gap:20
},
textContainer:{
  flex:1,
  gap:5
},
image:{
  borderColor:'rgb(235, 237, 251)',
  height:50,
  width:50
},
locationcontainer:{
  display:'flex',
  flexDirection:'row',
  alignItems:'center'
},

 name:{
    fontSize: 20,
    fontWeight: 'bold',
  },
  location:{
    fontSize:16,
    fontWeight:'normal',
    color:'grey'
  }
});
export default HospitalView;

