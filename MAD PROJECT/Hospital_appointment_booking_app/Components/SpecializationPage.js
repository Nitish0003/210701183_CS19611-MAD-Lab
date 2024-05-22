import React from 'react';
import { View, Text, ScrollView, TouchableOpacity} from 'react-native';
import { Card } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const SpecializationPage = ({ route }) => {
  const { specializationNames, specializationid, hospitalId } = route.params;
  const navigation = useNavigation();


const handleSpecializationClick = async (specializationId) => {
    try{
        const doctorres = await fetch(`http://10.0.2.2:5000/api/doctor_specialization_mapping/${specializationId}`);

        const doctortext = await doctorres.text();

        let doctordata;
        try{
            doctordata = JSON.parse(doctortext);
           
        }catch(jsonError)
        {
            console.error('Error parsing JSON:', jsonError);
            if(doctorres.status === 404)
            {
                console.log('error');
                throw new Error('errorr');
            }
            else{
                console.log("error");
            }
        }
        console.log(doctordata);

        const doctorsPromises = doctordata.map(async (doctorId) => {
            try {
               
                const doctorInfoResponse = await fetch(`http://10.0.2.2:5000/api/doctors/${doctorId}?hospitalId=${hospitalId}`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
              
              if (!doctorInfoResponse.ok) {
                throw new Error(`Error fetching doctor details. Status: ${doctorInfoResponse.status}`);
              }
              const doctorInfoData = await doctorInfoResponse.json();
              return doctorInfoData;
            }
            catch(e)
            {

            }
        });
        const doctorsInfo = await Promise.all(doctorsPromises);
        console.log(doctorsInfo);

        navigation.navigate('DoctorPage', {doctorsInfo });

    }
    catch(e)
    {

    }
  };
  



  return (
    <ScrollView>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, alignSelf: 'center' }}>Specializations</Text>
        {specializationNames.map((name, index) => (
          <TouchableOpacity key={index} onPress={() => handleSpecializationClick(specializationid[index])}>
            <Card containerStyle={{ borderRadius: 10, marginBottom: 10, shadowColor: '#90EE90', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4 }}>
              <Text style={{ fontSize: 18, marginBottom: 5 }}>{name}</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default SpecializationPage;
