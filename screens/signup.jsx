import { Alert } from 'react-native';
import axios from 'axios';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import BASE_URL from '../config';

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSignUp = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      console.log("Sending data:", { username, password });
      const response = await axios.post(`${BASE_URL}/register`, {
        username,
        password,
      });

      if (response.status === 201 || response.data.success) {
        Alert.alert("Success", "User registered successfully!", [
          { text: "OK", onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      const message = error.response?.data?.message || "Registration failed.";
      Alert.alert("Error", message);
    }
  };

  return (
   
<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
  <ImageBackground
    source={require('../assets/bg_image.jpeg')} 
    style={styles.background}
    resizeMode="cover"
  >
    <View style={styles.container}>
      {/* Your title, inputs, checkbox, and button */}
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Create your account to illuminate your journey</Text>

      {/* Username Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          placeholder="Enter your username"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          placeholder="Re-enter your password"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      {/* Checkbox */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setAgreeTerms(!agreeTerms)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
          {agreeTerms && <FontAwesome name="check" size={12} color="#0c0c0c" />}
        </View>
        <Text style={styles.checkboxText}>I agree with Terms & Conditions</Text>
      </TouchableOpacity>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signUpBtn} onPress={handleSignUp}>
        <Text style={styles.signUpText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footerText}>
        Already registered?
        <Text
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        > Log In</Text>
      </Text>
    </View>
  </ImageBackground>
</ScrollView>
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
      paddingVertical: 40,
      // remove backgroundColor since image is now the background
    },
    
    title: {
      fontSize: 28,
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: '#fff',
      textAlign: 'center',
      marginBottom: 30,
    },
    inputContainer: {
      flexDirection: 'row',
      backgroundColor: '#1e1e1e',
      borderRadius: 10,
      alignItems: 'center',
      paddingHorizontal: 10,
      marginBottom: 15,
    },
    icon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      color: '#fff',
      height: 50,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#ccc',
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: '#fff',
      borderColor: '#fff',
    },
    checkboxContainer: {
      flexDirection: 'row',      // inline layout
      alignItems: 'center',      // vertically center checkbox and text
      marginBottom: 20,          // space from next element
    },
    
    checkboxText: {
      color: '#fff',
      marginLeft: 10,            // space between checkbox and text
      fontSize: 14,
    },
    
    signUpBtn: {
      backgroundColor: '#fff',
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 25,
    },
    signUpText: {
      color: '#0c0c0c',
      fontWeight: 'bold',
      fontSize: 16,
    },
    footerText: {
      textAlign: 'center',
      color: '#aaa',
    },
    loginLink: {
      color: '#ff0000',
      fontWeight: 'bold',
    },
  });

