import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, Dimensions, BackHandler } from 'react-native';
import { API, graphqlOperation } from "aws-amplify";
import { createTicket } from './src/graphql/mutations';
import BarcodeMask from 'react-native-barcode-mask';
import { Camera } from 'expo-camera';
import { TextInput } from 'react-native-paper';
import { View, Item, Icon, Text} from 'native-base';
import {  Avatar } from 'react-native-elements';
import Modal, { ModalContent, ModalFooter, ModalButton } from 'react-native-modals';
import moment from 'moment';

export default function Barcode() {

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('Enter ticket number');
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [showMe, setShowMe] = useState(false);

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
          { text: "OK", onPress: () => setScanned(false) }
        ],
        { cancelable: false }
        )
    }

    catch(e){
      Alert.alert(
        "Error",
        "There was a problem adding the requested ticket because it has already been added or processed. Please try again.",
        [
          { text: "OK", onPress: () => setScanned(false)}
        ],
        { cancelable: false }
        );
      }
  }

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setBarcode(data);
    setShowMe(true);
  };


  return (
    <View style={{ flex:1 }}>
    <View style={{ flex:1 }}>
      <Camera
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject, styles.cameraContainer}
      />
      <BarcodeMask width={300} height={150} lineAnimationDuration={1000} showAnimatedLine={false}/>
      <Text style={{ fontSize:30, color:'white' }}>Scan Barcode</Text>
    </View>
   <View>
   <Modal.BottomModal
      visible={showMe}
		  animationDuration={500}
      overlayOpacity={0.8}
      onHardwareBackPress={() => setShowMe(false) }
      onTouchOutside={() => setShowMe(false)}
    >
        <ModalContent
          style={{
          backgroundColor: 'fff',
			    bottom: 0,
          padding:300,
          height:420
          }}
        >
        <Avatar rounded source= {require('./assets/images/cars/key.jpg')} size='large' left={'40%'} />  
			  <Text style= {{ fontSize:40, color:'#693e94', textAlign:'center',  letterSpacing: -3, bottom:0 }}>TICKET NUMBER</Text>
			  <Text style= {{ fontSize:40, color:'#693e94', textAlign:'center',  letterSpacing: -5, bottom:0 }}>{barcode}</Text>
         
          <TextInput
            mode='outlined'
            placeholder='Vehicle Make (Optional)'
            onChangeText={text => setCarMake(text)}
          />    
        
          <TextInput
            mode='outlined'
            placeholder='Vehicle Model (Optional)'
            onChangeText={text => setCarModel(text)}
          />    
       
        <Text style= {{ fontSize:13, color:'gray', letterSpacing: 0 }}>{'\n'}This key will be added to the system on {moment(new Date()).format("MMM DD, YYYY h:mm A")}
        </Text>
        
        </ModalContent>

		  	<ModalFooter>
			    <ModalButton
				    text="ADD TICKET"
				    textStyle={{color:'#F95959', fontSize:20}}
            onPress={() => {setShowMe(false), this.addTicket(barcode,carMake,carModel)} }
            key="button-1"
          />
        </ModalFooter>
    </Modal.BottomModal>
  </View>
  </View>
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