import axios from 'axios';
import { Alert } from 'react-native';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,ImageBackground} from 'react-native';
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';


export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        username,
        password,
      });

      console.log('Response:', response.data);

      if (response.status === 200 && response.data.success) {
        // Store username in AsyncStorage for later use
        await AsyncStorage.setItem('username', username);

        Alert.alert('Success', 'Logged in successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Dashboard'),
          },
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Invalid login. Please try again.');
      }
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Login failed.';
      Alert.alert('Error', message);
    }
  };

  return (
    <ImageBackground
    source={require('../assets/bg_image.jpeg')} // replace with your image path
    style={styles.background}
    resizeMode="cover"
  >
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Log in to continue</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#999" style={styles.icon} />
        <TextInput
          placeholder="Enter your username"
          placeholderTextColor="#777"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.icon} />
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#777"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Log In</Text>
      </TouchableOpacity>

      <Text style={styles.signup}>
        Need to create an account?
        <Text style={styles.signupLink} onPress={() => navigation.navigate('SignUp')}>
          {' '}Sign Up
        </Text>
      </Text>
    </View>
  </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
  },
  loginBtn: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#121212',
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  orText: {
    color: '#999',
    marginHorizontal: 10,
  },
  socialBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  socialText: {
    fontSize: 14,
    color: '#000',
  },
  signup: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  signupLink: {
    color: '#ff0000',
  },
});
