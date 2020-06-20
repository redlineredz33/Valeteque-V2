import React from 'react';
import { withAuthenticator, AmplifyTheme } from "aws-amplify-react-native"
import { SafeAreaView, Image, View, Alert, ScrollView, StyleSheet, Dimensions ,YellowBox, TouchableHighlight, Text,KeyboardAvoidingView } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ListItem, Input, Button, Avatar } from 'react-native-elements';
import logo from './assets/splash.png';
import TouchableScale from 'react-native-touchable-scale';
import { Searchbar } from 'react-native-paper';
import PieChart from 'react-native-pie-chart';
import { LinearGradient } from 'react-native-linear-gradient';
import { TouchableOpacity, TouchableNativeFeedback } from 'react-native-gesture-handler';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { API, graphqlOperation } from "aws-amplify";
import { listTickets } from './src/graphql/queries';
import { createTicket } from './src/graphql/mutations';
import * as subscriptions from "./src/graphql/subscriptions";
import * as mutations from "./src/graphql/mutations";
import Loader from './Loader';
import Modal, {
	ModalContent,
	ModalFooter,
	ModalButton
  } from 'react-native-modals';


import Barcode from './Barcode';
import moment from "moment";

import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';

import config from "./aws-exports"
Amplify.configure(config);

const windowHeight = Dimensions.get('window').height;

class App extends React.Component {
	constructor() {
		super();
			global.paidCount= 0;
			global.freeCount= 0;
			global.carCount= 0;
			global.shiftStart = moment(new Date()).format("MMM DD, YYYY h:mm A");
	}
	render() {
		return (
			<AppContainer />
		);
	  }
}

class MainScreen extends React.Component {

	constructor() {
		super();
		YellowBox.ignoreWarnings(['Setting a timer']);

        this.state = {
			tickets: [],
			id: "",
			make: "",
			model: "",
			processed: false,
			loading: false,
			showMe: false,
			modalData: 0
		}
	}

	getLoadingScreen = () => {
		this.setState({
		  loading: true
		});
		setTimeout(() => {
		  this.setState({
			loading: false
		  });
		}, 1000);
	  }

	getTickets = async () => {
		const ticketData = await API.graphql(graphqlOperation(listTickets, {
			filter: {
				processed: {
					eq: false
				}
			}
		}))
		this.setState({ tickets: ticketData.data.listTickets.items })
		this.setState({data:this.state.tickets});
	}

	componentDidMount = async () => {
		this.getTickets();
		this.createSubscription = API.graphql(graphqlOperation(subscriptions.onCreateTicket)).subscribe(() => this.getTickets());
		this.updateSubscription = API.graphql(graphqlOperation(subscriptions.onUpdateTicket)).subscribe(() => this.getTickets());
		
	}

	componentWillUnmount = async () => {
		this.createSubscription.unsubscribe()
		this.updateSubscription.unsubscribe()
	}

	updateTicket = async (itemId) => {
		await API.graphql(graphqlOperation(mutations.updateTicket, {input: { id:itemId, processed:true }}))
	}

	deleteItemById = (itemId) => {
		const filteredData = this.state.data.filter(item => item.id !== itemId);
		this.setState({ data: filteredData });
	}

	renderEmptyContainer = () => {
		return(
		<ListItem style={styles.item}
				title={'To add a ticket'}
				titleStyle= {{ fontSize:30, alignSelf:'center' }}
				subtitle={'please press barcode icon'}
				subtitleStyle={{alignSelf:'center'}}
				style={{ alignContent:'center' }}
		/>
		)
	}

	renderHeader = () => {   
		return (       
		<Searchbar
			placeholder="Type in ticket number here..."
			onChangeText={text => this.searchInputFunction(text)}
			onClearText={() => this.searchInputFunction(null) }
			ref={"searchbar"}
		/>
		);  
	};


	searchInputFunction = (text) => {    
		const newData = this.state.tickets.filter(item => {      
		const itemData = `${item.id}`;
		const textData = `${text}`;
		return itemData.indexOf(textData) > -1;    
		});
	
		if(this.state.textData == "")
			this.setState({ data: this.state.tickets });
		else
			this.setState({ data: newData });  
	};

	passDataToModal=(item)=>{
		this.setState({
			modalData: item,
			showMe: true,
			dateInfo: moment(item.createdAt).format("MMM DD, YYYY h:mm:ss A"),
			dateDelta: moment.duration(moment().diff(item.createdAt)).humanize()
		});
	}
	
	render() {
	return(	
		
		<SafeAreaView style={{flex:3}}>
        	<Loader
          		loading={this.state.loading} />
		  	
		<View style= {{ flex: 1, backgroundColor: '#EDEDED' }}>
		<KeyboardAvoidingView>
		<Image source={logo} style={{ alignSelf: 'center', top: '33%', height:350, width:350 }}/> 
		</KeyboardAvoidingView>

		<ScrollBottomSheet
			style={{backgroundColor: 'white'}}
			enableEmptySections={true}
        	componentType="FlatList"
       		snapPoints={['15%', windowHeight - 425]}
        	initialSnapIndex={1}
        	renderHandle={() => (
        		<View style={styles.header}>
       			<View style={styles.panelHandle} />
        		</View>
			)}
			ListEmptyComponent={this.renderEmptyContainer()}
			data= { this.state.data }
			renderItem={({ item }) => 			
				<TouchableOpacity onPress = {()=> { this.passDataToModal(item) }}>
				<ListItem style={styles.item}
					Component = { TouchableScale } 
					friction={80} 
					tension={100} 
					activeScale={0.95} 
					leftAvatar={{ rounded:true, source: require('./assets/images/cars/key.jpg'), size: 'large' }}
					title={item.id.toString()}
					titleStyle= {{fontSize:30}}
					subtitle={'Key added: \n' + moment(item.createdAt).format("MMM DD, YYYY h:mm:ss A") + "\n" + item.make + " " + item.model}
					style={styles.listItemStyle}
					chevron
				/>
				</TouchableOpacity>
			}
			keyExtractor={item => item.id}
			extraData={this.state}
			ListHeaderComponent={this.renderHeader()} 
		/>

		<Modal.BottomModal
          visible={this.state.showMe}
		  onTouchOutside={() => this.setState({ showMe: false })}
		  onSwipeOut={() => this.setState({ showMe: false })}
		  animationDuration={500}
		  overlayOpacity={0.8}
        >
          <ModalContent
            style={{
              backgroundColor: 'fff',
			  bottom: 0,
			  padding:300,
			  height:320
            }}
          >
			<Avatar rounded source= {require('./assets/images/cars/key.jpg')} size='large' left={'40%'} />

			<Text style= {{ fontSize:40, color:'#693e94', textAlign:'center',  letterSpacing: -3, bottom:0 }}>TICKET NUMBER</Text>
			<Text style= {{ fontSize:70, color:'#693e94', textAlign:'center',  letterSpacing: -5, bottom:0 }}>{this.state.modalData.id}</Text>
			<Text style= {{ fontSize:15, color:'gray', textAlign:'center', letterSpacing: 0, bottom:0 }}>This ticket was added on {this.state.dateInfo}.</Text>
			<Text style= {{ fontSize:15, color:'gray', textAlign:'center', letterSpacing: 0, bottom:0 }}>Currently, this ticket has been keyed in for {this.state.dateDelta}.</Text>
			<Text style= {{ fontSize:15, color:'gray', textAlign:'center', letterSpacing: 0, bottom:0 }}>{this.state.modalData.make} {this.state.modalData.model}</Text>
          	</ModalContent>

		  	<ModalFooter>
              <ModalButton
				text="PAID"
				textStyle={{color:'#F95959', fontSize:20}}
                onPress={() => {this.setState({ showMe: false }), paidCount++,this.updateTicket(this.state.modalData.id), this.deleteItemById(this.state.modalData.id)}}
                key="button-1"
              />
              <ModalButton
				text="FREE"
				textStyle={{color:'#F95959', fontSize:20}}
                onPress={() => {this.setState({ showMe: false }), freeCount++, this.updateTicket(this.state.modalData.id), this.deleteItemById(this.state.modalData.id)}}
				key="button-2"
              />
			<ModalButton
				text="CANCEL"
				textStyle={{color:'#F95959', fontSize:20}}
                onPress={() => {this.setState({ showMe: false })}}
                key="button-3"
              />
            </ModalFooter>
        </Modal.BottomModal>

		</View>
  
		<View>

		<TouchableHighlight style={styles.addButton}
		  underlayColor= '#F95959' 
		  onPress={() => {this.props.navigation.navigate('BarcodeScanner'), this.getLoadingScreen()}}
		>
		<Image source={require('./assets/icons/barcode.png')} style={{ width:'70%', height:'70%', tintColor:'white' }}></Image>
		</TouchableHighlight>
		</View>
		</SafeAreaView>
	  );
	}
  }
  
  class Settings extends React.Component {

	checkUser = async () => {
		let user = await Auth.currentUserInfo(); 
		const now = moment() 
		Alert.alert(
			'Current User Information',
			'\nUsername: ' + user.attributes.email + '\n\nShift Start Time: ' + shiftStart + '\n\nCurrent Shift Length:\n' 
			+ moment.duration(now.diff(shiftStart)).humanize(),  
			[
				{text: 'Cancel', onPress: () => console.log('Cancel'), cancelable: true},
			], 
			{ cancelable: false }
			)
	}

	render() {
	  return(
		<View style={{backgroundColor: 'white', flex:1}}>
			<View style= {{ flex: 1 }}>
			<View style= {{ height: 300,  borderBottomWidth: 1, borderBottomColor: '#dddddd', backgroundColor: 'white'}}>
				<Image source={logo} style={{ alignSelf: 'center', top: '20%', height:(Dimensions.get('screen').height/4), 
				width:(Dimensions.get('screen').height/4) }}/>
			</View>
		  <ScrollView>
			<ListItem            
			  Component = { TouchableScale }
			  friction={80} 
			  tension={100} 
			  activeScale={0.85} 
			  title={"Log Out"}
			  titleStyle= {{fontSize:30}}
			  leftAvatar={{ source: require('./assets/icons/log_out.png'), rounded: false, tintColor: '#2f95dc' }}
			  subtitle={"Click here to log out of Valeteque"}
			  onPress={()=>{paidCount= 0, freeCount = 0, Auth.signOut()}}
			  style={styles.listItemStyle}
			  bottomDivider
			  chevron
			>
			</ListItem>
			<ListItem            
			  Component = { TouchableScale }
			  friction={80} 
			  tension={100} 
			  activeScale={0.85} 
			  title={"Shift Report"}
			  titleStyle= {{fontSize:30}}
			  leftAvatar={{ source: require('./assets/icons/report.png'), rounded: false, tintColor: '#2f95dc' }}
			  subtitle={"Click here to view your current shift summary"}
			  onPress={() => this.props.navigation.navigate('ShiftReport')}
			  style={styles.listItemStyle}
			  bottomDivider
			  chevron
			>
			</ListItem>
			<ListItem            
			  Component = { TouchableScale }
			  friction={80} 
			  tension={100} 
			  activeScale={0.85} 
			  title={"User Information"}
			  titleStyle= {{fontSize:30}}
			  leftAvatar={{ source: require('./assets/icons/user.png'), rounded: false, tintColor: '#2f95dc' }}
			  subtitle={"Click here to view the current user"}
			  onPress={()=>{ this.checkUser().toString() }}
			  style={styles.listItemStyle}
			  bottomDivider
			  chevron
			>
			</ListItem>
		  </ScrollView>
		  </View>
		</View>
	  );
	}
  }
  
class BarcodeScanner extends React.Component{
	static navigationOptions = {
		title: "Barcode Scanner",
		headerShown: false
	};


	render() {
		return (
			<Barcode/>
		);
	}
}

	class AddTicket extends React.Component {
		static navigationOptions = {
			title: "Add Ticket",
			headerShown: true,
			headerStyle:{backgroundColor: '#e04a2f'},
			headerTintColor: 'white'
		};

		constructor(){
			super();

			this.state = {
				id: 0,
				make: '',
				model: '',
				processed: false,
				tickets: []
			}
		}

		addTicket = async (stateData) => {
			await API.graphql(graphqlOperation(createTicket,{ 
			  input: {
				id:stateData, 
				make:this.state.make, 
				model:this.state.model, 
				processed:this.state.processed
			  }
			}
			))
		  }
		
		render() {
			id = this.props.navigation.getParams('text','nothing sent');
		  return (
			<ScrollView style= {{width:'75%', alignSelf: 'center'}} behavior="padding">
		
		<Image source={logo} style={{ alignSelf: 'center', top:'5%', height:(Dimensions.get('screen').height/2), 
				width:(Dimensions.get('screen').height/2) }}/>

			<Input
   			placeholder="Ticket Number (Required)"
			onChangeText={value => this.setState({ id: value })}
			defaultValue={id}
  			/>
 			<Input
   			placeholder="Make (Optional)"
   			style={styles}
   			onChangeText={value => this.setState({ make: value })}
  			/>
			<Input
   			placeholder="Model (Optional)"
   			style={styles}
   			onChangeText={value => this.setState({ model: value })}
  			/>
		
			<Button
				onPress= {() => { API.graphql(graphqlOperation(
				createTicket,
				{ input: {
					id:this.state.id, 
					make:this.state.make, 
					model:this.state.model, 
					processed:this.state.processed
				}}
			  	)),this.props.navigation.goBack(null)}}	
				title='Enter Ticket'
				raised				
			/>
     
			</ScrollView>
		  );
		}
	  }
	  

	class ShiftReport extends React.Component{
		static navigationOptions = {
			title: "Shift Report",
			headerShown: true,
			headerStyle:{backgroundColor: '#e04a2f'},
			headerTintColor: 'white'
		};


		render() {
			const totalDollars = paidCount*7
			const chart_wh = 350
			const series = [paidCount, freeCount]
			const sliceColor = ['#e04a2f', '#613d94']
			return (

				
				<View>

				<PieChart
					chart_wh={chart_wh}
					style={{ alignSelf:'center', top: '8%' }}
					series={series}
					sliceColor={sliceColor}
					doughnut={true}
					coverRadius={0.45}
					coverFill={'#FFF'}
			  	/>

				<ListItem            
			  		Component = { TouchableScale }
			  		friction={80} 
			  		tension={100} 
			  		activeScale={0.85} 
					title={"Shift Start Time"}
					subtitle={shiftStart}
					titleStyle= {{fontSize:20}}
					style={styles.shiftReportStyle}
			  		bottomDivider
				>
				</ListItem>				  
				<ListItem            
			  		Component = { TouchableScale }
			  		friction={80} 
			  		tension={100} 
			  		activeScale={0.85} 
					title={"Paid Tickets"}
					leftAvatar={{backgroundColor:'#e04a2f'}}
					titleStyle= {{fontSize:20}}
					badge={{value: paidCount, scaleX: 2, scaleY: 2, width: 40, right: '30%'}}
					style={styles.shiftReportStyle}
			  		bottomDivider
				>
				</ListItem>
				<ListItem            
			  		Component = { TouchableScale }
			  		friction={80} 
			  		tension={100} 
			  		activeScale={0.85} 
					title={"Free Tickets"}
					leftAvatar={{backgroundColor:'#613d94'}}
					titleStyle= {{fontSize:20}}
					badge={{value: freeCount, scaleX: 2, scaleY: 2, width: 40, right: '30%'}}
					style={styles.shiftReportStyle}
			  		bottomDivider
				>
				</ListItem>
				<ListItem            
			  		Component = { TouchableScale }
			  		friction={80} 
			  		tension={100} 
			  		activeScale={0.85} 
					title={"Total Cash Deposit"}
					titleStyle= {{fontSize:20}}
					badge={{value: "$" + totalDollars.toFixed(2), scaleX: 3.2, scaleY: 3.2, width: 60, right: '90%'}}
					subtitle={"Total of all cash transactions:"}
					style={styles.shiftReportStyle}
			  		bottomDivider
				>
				</ListItem>
				</View>
			);
		}
	}
  

  const bottomTabNavigator = createBottomTabNavigator(
	{
	  Home: {
		screen: MainScreen,
		navigationOptions: {
		  tabBarIcon: ({ tintColor }) => (
			<FontAwesome name="home" size={25} color={tintColor} />
		  )
		}
	  },
	  Settings: {
		screen: Settings,
		navigationOptions: {
		  tabBarIcon: ({ tintColor }) => (
			<FontAwesome name="user-circle" size={25} color={tintColor} />
		  )
		}
	  }
	},
	{
	  initialRouteName: 'Home',
	  tabBarOptions: {
		activeTintColor: '#e04a2f'
	  }
	}
);

  const screenStackNavigator = createStackNavigator(
	{
		BarcodeScanner: {
			screen: BarcodeScanner,
		},
		ShiftReport: {
			screen: ShiftReport
		},
		AddTicket: {
			screen: AddTicket,
		},
		BottomTabNavigator: {
			screen: bottomTabNavigator,
			navigationOptions: {
				headerShown: false
			}
		  }
		},
	  {
		initialRouteName: 'BottomTabNavigator',
	  }
  );
  
  const addTicketStyles = StyleSheet.create({
	container: {
	  flex: 1,
	  justifyContent: 'center',
	},
	item: { padding: 10 },
	name: { fontSize: 20 },
	description: { fontWeight: '600', marginTop: 4, color: 'rgba(0, 0, 0, .5)' },
	city: { marginTop: 4 }
  })

  const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 22
	  },
	  modalView: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
		  width: 0,
		  height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5
	  },
	addTicketContainer: {
		flex: 1,
		backgroundColor: '#fff',
		paddingHorizontal: 10,
		paddingTop: 50
	  },
	addTicketInput: {
		height: 50,
		borderBottomWidth: 2,
		borderBottomColor: 'blue',
		marginVertical: 10
	  },
	  addTicketButtonContainer: {
		backgroundColor: '#34495e',
		marginTop: 10,
		marginBottom: 10,
		padding: 10,
		borderRadius: 5,
		alignItems: 'center'
	  },
	  addTicketButtonText: {
		color: '#fff',
		fontSize: 24
	  },
	mainContainer: {
		flex: 1,
		marginTop: 50,
		backgroundColor: 'white'
	},
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0,
	},
	rectangleContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent'
	},
	contentContainerStyle: {
		padding: 30,
		backgroundColor: 'gray',
	},
	rectangle: {
		height: 300,
		width: 250,
		borderWidth: 2,
		borderColor: '#00FF00',
		backgroundColor: 'white',
		shadowColor: "#000000",
		shadowOpacity: 5,
		shadowRadius: 50,
		shadowOffset: {
			height: 10,
			width: 10
	  	},
	  	elevation: 20
	},
	shiftReportStyle: {
		top: '15%'
	},
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
		
	},
	saveButton: {
		borderWidth: 1,
		borderColor: '#007BFF',
		backgroundColor: '#007BFF',
		padding: 15,
		margin: 5
	  },
	  saveButtonText: {
		color: '#FFFFFF',
		fontSize: 20,
		textAlign: 'center'
	  },
	item: {
		padding: 20,
		justifyContent: 'center',
		backgroundColor: 'white',
		alignItems: 'center',
		marginVertical: 10
	  },   
	header: {
		marginTop: 30,
		alignItems: 'center',
		backgroundColor: 'white',
		paddingVertical: 20,
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: -10,
		},
		shadowOpacity: 0.58,
		shadowRadius: 16.00,
		elevation: 20,
		backgroundColor : 'white'
	},
	panelHandle: {
		width: 40,
		height: 2,
		backgroundColor: 'gray',
		borderRadius: 4
	},
	addButton: {
	  	backgroundColor: '#F95959',
	  	borderColor: '#F95959',
	  	borderWidth: 1,
	  	height: 90,
	  	width: 90,
	  	borderRadius: 50,
	  	alignItems: 'center',
	  	justifyContent: 'center',
	 	position: 'absolute',
	  	bottom: 20,
	  	right:20,
	  	shadowColor: "#000000",
	  	shadowOpacity: 5,
	  	shadowRadius: 50,
	  	shadowOffset: {
			height: 10,
			width: 0
	  	},
	  	elevation: 5
	},
	header_footer_style: {
		width: '100%',
		height: 150,
		backgroundColor: '#F95959'
	},
	spinnerTextStyle: {
		color: '#FFF'
	  },
  });

  const amplifyTheme = {
	...AmplifyTheme,
	sectionHeader:{
	  ...AmplifyTheme.sectionHeader,
	  color:"red",
	},
	formSection: {
	  ...AmplifyTheme.formSection,
	  backgroundColor: "green",
	},
	sectionFooter: {
	  ...AmplifyTheme.sectionFooter,
	  backgroundColor: "purple"
	},
	button: {
		...AmplifyTheme.button,
		backgroundColor: "blue"
	}
  }
  
const AppContainer = createAppContainer(screenStackNavigator);

export default withAuthenticator(App,{ theme: amplifyTheme})