import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const SignUp = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');


  const handleSignUp = async () => {
    try {
      console.log("hi");
      const response = await fetch('http://10.0.2.2:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phoneNumber, password}),
      });

      console.log(response.status); 
      
      
     
      if (response.status === 200) {
        Alert.alert('Success', 'User registered successfully');
      } else {
        const data = await response.json();
        Alert.alert('Error', `Failed to sign up: ${data.message}`);
      }
    } catch (error) {
      console.error('Error during sign-up:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };
  return (

    <View style={styles.container}>
      {/* <Text style={styles.title}>MediBook</Text> */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
       
          <Icon name="user" size={20} color="black" style={styles.icon} />
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={(text) => setName(text)}
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="phone" size={20} color="black" style={styles.icon} />
          <TextInput
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(text)}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="black" style={styles.icon} />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.input}
          />
        </View>
        <Button
          title="Sign Up"
          onPress={handleSignUp}
          color="darkblue" // Set the button color to dark blue
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Montserrat', // Replace with your premium font
    color: 'darkblue',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue', // Set the app background color to light blue
  },
  formContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'black',
  },
  icon: {
    marginLeft: 10,
    marginRight: 5,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
});

export default SignUp;
