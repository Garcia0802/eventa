import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import WelcomeScreen from '../screens/common/WelcomeScreen';
import LoginScreen from '../screens/common/LoginScreen';
import RegisterScreen from '../screens/common/RegisterScreen';
import HomeScreen from '../screens/participant/HomeScreen';
import ExploreScreen from '../screens/participant/ExploreScreen';
import EventDetailsScreen from '../screens/participant/EventDetailsScreen';
import MyRegistrationsScreen from '../screens/participant/MyRegistrationsScreen';
import ProfileScreen from '../screens/participant/ProfileScreen';
import OrganizerRequestScreen from '../screens/participant/OrganizerRequestScreen';
import CreateEventScreen from '../screens/organizer/CreateEventScreen';
import DashboardScreen from '../screens/organizer/DashboardScreen';
import MyEventsScreen from '../screens/organizer/MyEventsScreen';
import ParticipantsScreen from '../screens/organizer/ParticipantsScreen';
import OrganizerRequestsScreen from '../screens/admin/OrganizerRequestsScreen';

import { useAuth } from '../context/AuthContext';
import { COLORS } from '../styles/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  const { user } = useAuth();
  const isOrganizer = user?.role === 'ORGANIZER';
  const isAdmin = user?.role === 'ADMIN';
  const canCreateEvents = isOrganizer || isAdmin;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home-outline',
            Explore: 'compass-outline',
            Dashboard: 'stats-chart-outline',
            CreateEvent: 'add-circle-outline',
            MyRegistrations: 'calendar-outline',
            Profile: 'person-outline',
            OrganizerRequests: 'shield-checkmark-outline',
            MyEvents: 'folder-open-outline',
            Participants: 'people-outline',
          };
          return <Ionicons name={icons[route.name] || 'help-circle-outline'} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.blueAccent,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: { backgroundColor: COLORS.white, borderTopColor: COLORS.border },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explorar' }} />
      {isOrganizer && <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Painel' }} />}
      {canCreateEvents && <Tab.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Criar evento' }} />}
      {isAdmin && <Tab.Screen name="OrganizerRequests" component={OrganizerRequestsScreen} options={{ title: 'Solicitações' }} />}
      <Tab.Screen name="MyRegistrations" component={MyRegistrationsScreen} options={{ title: 'Minhas inscrições' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      {isOrganizer && <Tab.Screen name="MyEvents" component={MyEventsScreen} options={{ title: 'Meus eventos' }} />}
      {isOrganizer && <Tab.Screen name="Participants" component={ParticipantsScreen} options={{ title: 'Participantes' }} />}
    </Tab.Navigator>
  );
}

function AuthStack() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      key={user ? 'authenticated' : 'unauthenticated'}
      initialRouteName={user ? 'AppTabs' : 'Welcome'}
      screenOptions={{ headerShown: false }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="AppTabs" component={AppTabs} />
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
          <Stack.Screen name="OrganizerRequest" component={OrganizerRequestScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  );
}
