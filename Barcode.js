import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, Dimensions, KeyboardAvoidingView} from 'react-native';
import { API, graphqlOperation } from "aws-amplify";
import { createTicket } from './src/graphql/mutations';
import BarcodeMask from 'react-native-barcode-mask';
import { Camera } from 'expo-camera';
import { View, Item, Icon, Label, Button, Input, Text} from 'native-base';


export default function Barcode() {

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('Enter ticket number');
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })()
  }, []);

  addTicket = async (stateData,make,model) => {
    try{
      await API.graphql(graphqlOperation(createTicket,{ 
        input: {
          id:stateData, 
          make:make, 
          model:model, 
          processed:false
        }
      }
      ))

      Alert.alert(
        "Success",
        'Ticket #' + barcode.toString() +' added successfully.',
        [
          { text: "OK" }
        ],
        { cancelable: false }
        )
    }

    catch(e){
      Alert.alert(
        "Error",
        "There was a problem adding the requested ticket because it has already been added or processed. Please try again.",
        [
          { text: "OK" }
        ],
        { cancelable: false }
        );
      }
  }

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setBarcode(data);
  };

  return (
    <KeyboardAvoidingView style={{ flex:1 }}>
    <View style={{ flex: 1 }}>
      <Camera
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject, styles.cameraContainer}
      />
      <BarcodeMask width={300} height={150} lineAnimationDuration={1000}/>
      <Text style={{ fontSize:30, color:'white' }}>Scan Barcode</Text>
    </View>
    <View style={styles.lowerSection}>
    <Item>
        <Label>Add Ticket Information</Label> 
    </Item>
    <Item>
        <Icon type={"Ionicons"} active name='md-barcode' />
        <Input
            placeholder='Barcode of the item'
            value={barcode.toString()}
        />    
    </Item>
    <Item>
        <Icon type={"Ionicons"} active name='md-barcode' />
        <Input
            placeholder='Vehicle Make (Optional)'
            onChangeText={text => setCarMake(text)}
            value={carMake}
        />    
    </Item>
    <Item>
        <Icon type={"Ionicons"} active name='md-barcode' />
        <Input
            placeholder='Vehicle Model (Optional)'
            onChangeText={text => setCarModel(text)}
            value={carModel}
        />    
    </Item>
    <Button
        primary
        onPress={() => {this.addTicket(barcode,carMake,carModel)}}
    >
      <Text>Add ticket</Text>
    </Button>
  </View>
  </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  cameraContainer: {
      height: Dimensions.get('screen').height,
      width: Dimensions.get('screen').width,
      backgroundColor: 'black',
      position: 'relative'
  },
  rescanIconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
    lowerSection: {
        paddingVertical: 60,
        paddingHorizontal: 20,
        backgroundColor: 'white',
    },
    camera: {
        height: '100%',
    },
});