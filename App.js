import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/landingpage';
import LoginScreen from './screens/loginpage';
import SignUpScreen from './screens/signup';
import DashboardScreen from './screens/Dashboard';
import UploadVideoScreen from './screens/uploadvideo'
import ReportScreen from './screens/report';
import VideoUploadConfirmation from './screens/confirmationpage';
import ProfileScreen from './screens/profile';
const Stack = createNativeStackNavigator();



export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="uploadVideo" component={UploadVideoScreen} />
        <Stack.Screen name="report" component={ReportScreen} />
        <Stack.Screen name="Confirm" component={VideoUploadConfirmation} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
