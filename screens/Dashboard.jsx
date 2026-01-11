import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setMenuOpen(false));
    } else {
      setMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleNavigation = (screen) => {
    toggleMenu();
    if (screen === 'Dashboard') return;
    navigation.navigate(screen);
  };

  const showContact = () => {
    Alert.alert(
      "Contact Us",
      "Email: probowler@gmail.com\nPhone: 03357890321",
      [{ text: "OK" }]
    );
  };

  return (
    <ImageBackground
      source={require('../assets/bg_image.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleMenu}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Dashboard</Text>
        </View>

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={styles.centerText}>
            Start your bowling journey here, upload your video
          </Text>

          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => navigation.navigate('uploadVideo')}
          >
            <Text style={styles.uploadText}>Upload Video</Text>
          </TouchableOpacity>
        </View>

        {/* Slide-in Menu */}
        {menuOpen && (
          <Animated.View style={[styles.menuContainer, { left: slideAnim }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation('Dashboard')}
            >
              <Text style={styles.menuText}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation('uploadVideo')}
            >
              <Text style={styles.menuText}>Upload Video</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation('ProfileScreen')}
            >
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>

          
            <TouchableOpacity style={styles.helpContainer} onPress={showContact}>
              <AntDesign name="questioncircleo" size={20} color="#000" style={{ marginRight: 10 }} />
              <Text style={styles.menuText}>Help</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </ImageBackground>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  centerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 25,
  },
  uploadBtn: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  uploadText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width * 0.6,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 100,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#fff',
    marginTop: 20,
  },
});
