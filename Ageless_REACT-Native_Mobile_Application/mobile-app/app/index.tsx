import { View, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { Button } from '../components/ui/Button';

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-3xl font-bold text-slate-900 mb-2">MindBodyHeart</Text>
      <Text className="text-slate-500 mb-8 text-center">
        Your fitness journey starts here.
      </Text>
      
      <Button 
        onPress={() => router.push('/dashboard')}
        className="w-full max-w-xs"
      >
        Go to Dashboard
      </Button>
    </View>
  );
}
