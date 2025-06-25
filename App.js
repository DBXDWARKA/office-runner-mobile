// App.js (Updated with TodaySummary screen)
import { BASE_URL } from './config';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';

import LoginScreen from './screens/LoginScreen';
import RunnerDashboard from './screens/RunnerDashboard';
import ManagerDashboard from './screens/ManagerDashboard';
import TripApprovalScreen from './screens/TripApprovalScreen';
import WeeklySummaryScreen from './screens/WeeklySummaryScreen';
import RunnerReport from './screens/RunnerReport';
import AdminDashboard from './screens/AdminDashboard';

// ✅ NEW Admin Screens
import AllUserScreen from './screens/AllUserScreen';
import AdminReports from './screens/AdminReports';
import BillingExport from './screens/BillingExport';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

// ✅ NEW Today Summary Screen
import TodaySummaryScreen from './screens/TodaySummaryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RunnerDashboard"
            component={RunnerDashboard}
            options={{
              headerTitle: 'Runner Dashboard',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="ManagerDashboard"
            component={ManagerDashboard}
            options={{
              headerTitle: 'Manager Dashboard',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="TripApprovalScreen"
            component={TripApprovalScreen}
            options={{
              headerTitle: 'Approve Trips',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="WeeklySummaryScreen"
            component={WeeklySummaryScreen}
            options={{
              headerTitle: 'Weekly Summary',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="RunnerReport"
            component={RunnerReport}
            options={{
              headerTitle: 'Runner Report',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboard}
            options={{
              headerTitle: 'Admin Dashboard',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="AllUsers"
            component={AllUserScreen}
            options={{
              headerTitle: 'All Users',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="AdminReports"
            component={AdminReports}
            options={{
              headerTitle: 'Admin Report',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="BillingExport"
            component={BillingExport}
            options={{
              headerTitle: 'Billing Export',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{
              headerTitle: 'Reset Password',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="TodaySummaryScreen"
            component={TodaySummaryScreen}
            options={{
              headerTitle: 'Today\'s Summary',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: '#fff',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
