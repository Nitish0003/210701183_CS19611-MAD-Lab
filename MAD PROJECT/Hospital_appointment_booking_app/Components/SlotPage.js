import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Button } from 'react-native-elements';

const SlotPage = ({ route }) => {
  const { doctorId, slotsData } = route.params;

  const handleSlotBooking = async (docSlotId, slotTime) => {
    // Implement your booking logic here
    try {
        // Make a POST request to the backend to book the slot
        const response = await fetch('http://10.0.2.2:5000/book-slot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ docSlotId }),
        });
    
        if (response.ok) {
          Alert.alert(`Booking Slot ${docSlotId} at ${slotTime} successful`);
        } else {
          Alert.alert('Error booking slot. Please try again.');
        }
      } catch (error) {
        console.error('Error booking slot:', error);
        Alert.alert('Error booking slot. Please try again.');
      }
  };

  return (
    <ScrollView>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, alignSelf: 'center' }}>Available Slots</Text>
        {slotsData.map((slot, index) => (
          <Card key={index} containerStyle={{ borderRadius: 10, marginBottom: 10, shadowColor: '#90EE90', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4 }}>
            <Text style={{ fontSize: 18, marginBottom: 5 }}>{`Slot ${index + 1}`}</Text>
            <Text>{`Time: ${slot.OP_START_TIME}`}</Text>
            <Button
              title="Book"
              onPress={() => handleSlotBooking(slot.DOC_SLOT_ID, slot.OP_START_TIME)}
              buttonStyle={{ marginTop: 10 }}
            />
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

export default SlotPage;
