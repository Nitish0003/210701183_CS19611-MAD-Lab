import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';



const Login = ({ setLoggedIn }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
 // const { setIsAuthenticated } = useAuth(); 

  const handleLogin = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        Alert.alert('Error', `Login failed: ${data.message}`);
        // Snackbar.show({
        //   text: `Login failed: ${data.message}`,
        //   duration: Snackbar.LENGTH_SHORT,
        //   backgroundColor: 'red', // You can customize the background color
        // });
        return;
      }

      const { token } = await response.json();

      await AsyncStorage.setItem('userToken', token);
      console.log(token);
     // setIsAuthenticated(true);

      Alert.alert('Success', 'Login successful', [
        {
          text: 'OK',
          onPress: () => {
            setLoggedIn(true);
            navigation.navigate('HomeTabs');

          },
        },
      ]);

    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <ImageBackground
    source={require('../assets/doctor.png')}
    style={styles.background}
  >
    <View style={styles.container}>
      {/* <Text style={{fontFamily:'Soul'}}>Login</Text> */}
      <View style={styles.formContainer}>
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
          title="Login"
          onPress={handleLogin}
          color="rgb(74, 92, 246)" // Set the button color to dark blue
        />
      </View>
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch'
   // opacity:0.5
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  //  backgroundColor: 'rgb(74, 92, 246)', // Set the app background color to light blue
  },
  formContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'rgb(237, 239, 255)',
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

export default Login;
