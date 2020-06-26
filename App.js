import React from "react";
import {
  Greetings,
  ConfirmSignIn,
  ConfirmSignUp,
  ForgotPassword,
  RequireNewPassword,
  SignIn,
  SignUp,
  VerifyContact,
  withAuthenticator,
} from "aws-amplify-react-native";
import { globalStyles, MyTheme, styles } from "./global";
import {
  SafeAreaView,
  Image,
  View,
  Alert,
  ScrollView,
  Dimensions,
  YellowBox,
  Text,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ListItem, Avatar } from "react-native-elements";
import logo from "./assets/splash.png";
import TouchableScale from "react-native-touchable-scale";
import { Searchbar, TextInput, Button } from "react-native-paper";
import PieChart from "react-native-pie-chart";
import {
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableHighlight,
} from "react-native-gesture-handler";
import ScrollBottomSheet from "react-native-scroll-bottom-sheet";
import { API, graphqlOperation } from "aws-amplify";
import { listTickets } from "./src/graphql/queries";
import { createTicket } from "./src/graphql/mutations";
import * as subscriptions from "./src/graphql/subscriptions";
import * as mutations from "./src/graphql/mutations";
import Modal, { ModalContent } from "react-native-modals";
import { FloatingAction } from "react-native-floating-action";

import Barcode from "./Barcode";
import moment from "moment";

import Amplify from "@aws-amplify/core";
import Auth from "@aws-amplify/auth";

import config from "./aws-exports";
Amplify.configure(config);

const windowHeight = Dimensions.get("window").height;

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    global.paidCount = 0;
    global.freeCount = 0;
    global.carCount = 0;
    global.shiftStart = moment(new Date()).format("MMM DD, YYYY h:mm A");
  }
  render() {
    return <AppContainer />;
  }
}

class MainScreen extends React.Component {
  constructor() {
    super();
    YellowBox.ignoreWarnings(["Setting a timer"]);

    this.state = {
      tickets: [],
      id: "",
      make: "",
      model: "",
      processed: false,
      loading: false,
      showMe: false,
      showAddTicket: false,
      showUpdateTicket: false,
      modalData: 0,
      showFab: true,
    };
  }

  getTickets = async () => {
    const ticketData = await API.graphql(
      graphqlOperation(listTickets, {
        filter: {
          processed: {
            eq: false,
          },
        },
        limit: 1000,
      })
    );
    this.setState({
      tickets: ticketData.data.listTickets.items.sort(
        (firstItem, secondItem) => secondItem.id - firstItem.id
      ),
    });
    this.setState({ data: this.state.tickets });
  };

  componentDidMount = async () => {
    this.getTickets();
    this.createSubscription = API.graphql(
      graphqlOperation(subscriptions.onCreateTicket)
    ).subscribe(() => this.getTickets());
    this.updateSubscription = API.graphql(
      graphqlOperation(subscriptions.onUpdateTicket)
    ).subscribe(() => this.getTickets());
  };

  componentWillUnmount = async () => {
    this.createSubscription.unsubscribe();
    this.updateSubscription.unsubscribe();
  };

  updateTicket = async (itemId) => {
    try {
      await API.graphql(
        graphqlOperation(mutations.updateTicket, {
          input: { id: itemId, processed: true },
        })
      );
    } catch (e) {
      Alert.alert(
        "Error",
        "There was a problem processing the requested ticket. Please try again.",
        [{ text: "OK" }],
        { cancelable: false }
      );
    }
  };

  updateTicketDetails = async (id, make, model) => {
    try {
      await API.graphql(
        graphqlOperation(mutations.updateTicket, {
          input: { id: id, make: make, model: model },
        })
      );
      Alert.alert(
        "Success",
        "Ticket #" + id.toString() + " has been updated successfully.",
        [{ text: "OK" }],
        { cancelable: false }
      );
    } catch (e) {
      Alert.alert(
        "Error",
        "There was a problem updating the requested ticket. Please try again.",
        [{ text: "OK" }],
        { cancelable: false }
      );
    }
  };

  deleteItemById = (itemId) => {
    const filteredData = this.state.data.filter((item) => item.id !== itemId);
    this.setState({ data: filteredData });
  };

  renderEmptyContainer = () => {
    return (
      <ListItem
        style={styles.item}
        title={"To add a ticket"}
        titleStyle={{ fontSize: 30, alignSelf: "center" }}
        subtitle={"please press barcode icon or add ticket icon"}
        subtitleStyle={{ alignSelf: "center" }}
        style={{ alignContent: "center" }}
      />
    );
  };

  renderHeader = () => {
    return (
      <Searchbar
        placeholder="Type in ticket number here..."
        onChangeText={(text) => this.searchInputFunction(text)}
        onClearText={() => this.searchInputFunction(null)}
        ref={"searchbar"}
      />
    );
  };

  searchInputFunction = (text) => {
    const newData = this.state.tickets.filter((item) => {
      const itemData = `${item.id}`;
      const textData = `${text}`;
      return itemData.indexOf(textData) > -1;
    });

    if (this.state.textData == "") this.setState({ data: this.state.tickets });
    else this.setState({ data: newData });
  };

  passDataToModal = (item) => {
    this.setState({
      modalData: item,
      showMe: true,
      dateInfo: moment(item.createdAt).format("MMM DD, YYYY h:mm:ss A"),
      dateDelta: moment.duration(moment().diff(item.createdAt)).humanize(),
    });
  };

  passDataToUpdateModal = (item) => {
    this.setState({
      updateTicketNum: item.id,
      updateMake: item.make,
      updateModel: item.model,
      lastUpdate: item.updatedAt,
      showUpdateTicket: true,
    });
  };

  addTicket = async (stateData, make, model) => {
    try {
      await API.graphql(
        graphqlOperation(createTicket, {
          input: {
            id: stateData,
            make: make,
            model: model,
            processed: false,
          },
        })
      );

      Alert.alert(
        "Success",
        "Ticket #" + stateData.toString() + " added successfully.",
        [
          {
            text: "OK",
            onPress: () => this.setState({ showAddTicket: false }),
          },
        ],
        { cancelable: false }
      );
    } catch (e) {
      Alert.alert(
        "Error",
        "There was a problem adding the requested ticket because it has already been added or processed. Please try again.",
        [
          {
            text: "OK",
            onPress: () => this.setState({ showAddTicket: false }),
          },
        ],
        { cancelable: false }
      );
    }
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 3 }}>
        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: "#EDEDED",
            position: "relative",
            zIndex: 1000,
          }}
        >
          <KeyboardAvoidingView>
            <Image
              source={logo}
              style={{
                alignSelf: "center",
                top: "33%",
                height: 350,
                width: 350,
              }}
            />
          </KeyboardAvoidingView>

          <ScrollBottomSheet
            style={{ backgroundColor: "white" }}
            enableEmptySections={true}
            componentType="FlatList"
            maxToRenderPerBatch={100}
            keyboardShouldPersistTaps="always"
            windowSize={41}
            snapPoints={["5%", windowHeight - 425]}
            initialSnapIndex={1}
            renderHandle={() => (
              <View style={styles.header}>
                <View style={styles.panelHandle} />
              </View>
            )}
            ListEmptyComponent={this.renderEmptyContainer()}
            data={this.state.data}
            renderItem={({ item }) => (
              <TouchableNativeFeedback
                onPress={() => {
                  this.passDataToModal(item);
                }}
              >
                <ListItem
                  Component={TouchableScale}
                  friction={80}
                  tension={100}
                  activeScale={0.95}
                  leftAvatar={{
                    rounded: true,
                    source: require("./assets/images/cars/key.jpg"),
                    size: "large",
                  }}
                  title={item.id.toString()}
                  titleStyle={{ fontSize: 30 }}
                  subtitle={
                    "Key added: \n" +
                    moment(item.createdAt).format("MMM DD, YYYY h:mm:ss A") +
                    "\n" +
                    item.make +
                    " " +
                    item.model
                  }
                  chevron
                />
              </TouchableNativeFeedback>
            )}
            keyExtractor={(item) => item.id}
            extraData={this.state}
            ListHeaderComponent={this.renderHeader()}
          />

          <Modal.BottomModal
            visible={this.state.showMe}
            onTouchOutside={() => this.setState({ showMe: false })}
            onSwipeOut={() => this.setState({ showMe: false })}
            animationDuration={300}
            overlayOpacity={0.8}
          >
            <ModalContent
              style={{
                backgroundColor: "fff",
                bottom: 0,
                padding: 300,
                height: 520,
              }}
            >
              <Avatar
                rounded
                source={require("./assets/images/cars/key.jpg")}
                size="large"
                left={"40%"}
              />

              <Text
                style={{
                  fontSize: 40,
                  color: "#693e94",
                  textAlign: "center",
                  letterSpacing: -3,
                  bottom: 0,
                }}
              >
                TICKET NUMBER
              </Text>
              <Text
                style={{
                  fontSize: 50,
                  color: "#693e94",
                  textAlign: "center",
                  letterSpacing: -5,
                  bottom: 0,
                }}
              >
                {this.state.modalData.id}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: "gray",
                  textAlign: "center",
                  letterSpacing: 0,
                  bottom: 0,
                }}
              >
                {"\n"}This ticket was added on {this.state.dateInfo}.
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: "gray",
                  textAlign: "center",
                  letterSpacing: 0,
                  bottom: 0,
                }}
              >
                Currently, this ticket has been keyed in for{" "}
                {this.state.dateDelta}.
              </Text>

              <Button
                mode="contained"
                style={{ marginTop: 20, borderRadius: 45 }}
                onPress={() => {
                  Alert.alert(
                    "Confirm Paid Ticket",
                    "Are you sure you want to process this ticket as a PAID transaction? You will not be able to reverse this action.",
                    [
                      {
                        text: "Cancel",
                        cancelable: false,
                      },
                      {
                        text: "Confirm",
                        onPress: () => {
                          this.setState({ showMe: false }),
                            paidCount++,
                            this.updateTicket(this.state.modalData.id),
                            this.deleteItemById(this.state.modalData.id);
                          this.setState({ showFab: true });
                        },
                        cancelable: false,
                      },
                    ],
                    { cancelable: false }
                  );
                }}
              >
                PAID
              </Button>

              <Button
                mode="contained"
                style={{ marginTop: 10, borderRadius: 45 }}
                onPress={() => {
                  Alert.alert(
                    "Confirm Free Ticket",
                    "Are you sure you want to process this ticket as a FREE transaction? You will not be able to reverse this action.",
                    [
                      {
                        text: "Cancel",
                        cancelable: false,
                      },
                      {
                        text: "Confirm",
                        onPress: () => {
                          this.setState({ showMe: false }),
                            freeCount++,
                            this.updateTicket(this.state.modalData.id),
                            this.deleteItemById(this.state.modalData.id);
                        },
                        cancelable: false,
                      },
                    ],
                    { cancelable: false }
                  );
                  this.setState({ showFab: true });
                }}
              >
                FREE
              </Button>
              <Button
                mode="contained"
                style={{ marginTop: 10, borderRadius: 45 }}
                onPress={() => {
                  this.setState({ showMe: false });
                  this.passDataToUpdateModal(this.state.modalData);
                  this.setState({ showUpdateTicket: true });
                  this.setState({ showFab: true });
                }}
              >
                UPDATE TICKET
              </Button>
              <Button
                mode="contained"
                style={{ marginTop: 10, borderRadius: 45 }}
                onPress={() => {
                  this.setState({ showMe: false });
                  this.setState({ showFab: true });
                }}
              >
                CANCEL
              </Button>
            </ModalContent>
          </Modal.BottomModal>

          <Modal.BottomModal
            visible={this.state.showAddTicket}
            animationDuration={300}
            overlayOpacity={0.8}
            onSwipeOut={() => this.setState({ showAddTicket: false })}
            onTouchOutside={() => this.setState({ showAddTicket: false })}
          >
            <ModalContent
              style={{
                backgroundColor: "fff",
                bottom: 0,
                padding: 300,
                height: 530,
              }}
            >
              <Avatar
                rounded
                source={require("./assets/images/cars/key.jpg")}
                size="large"
                left={"40%"}
              />

              <Text
                style={{
                  fontSize: 40,
                  color: "#693e94",
                  textAlign: "center",
                  letterSpacing: -3,
                  bottom: 0,
                }}
              >
                ADD TICKET
              </Text>

              <TextInput
                mode="outlined"
                placeholder="Ticket Number (Required)"
                onChangeText={(text) => this.setState({ id: text })}
                value={this.state.id}
              />

              <TextInput
                mode="outlined"
                onChangeText={(text) => this.setState({ make: text })}
                label="Vehicle Make (Optional)"
              />

              <TextInput
                mode="outlined"
                onChangeText={(text) => this.setState({ model: text })}
                label="Vehicle Model (Optional)"
              />

              <Text style={{ fontSize: 13, color: "gray", letterSpacing: 0 }}>
                {"\n"}This key will be added to the system on{" "}
                {moment(new Date()).format("MMM DD, YYYY h:mm A")}
              </Text>

              <Button
                mode="contained"
                style={{ marginTop: 20, borderRadius: 45 }}
                onPress={() => {
                  Keyboard.dismiss();
                  this.setState({ showAddTicket: false }),
                    this.addTicket(
                      this.state.id,
                      this.state.make,
                      this.state.model
                    );
                  this.setState({ showFab: true });
                }}
              >
                ADD TICKET
              </Button>

              <Button
                mode="contained"
                style={{ marginTop: 10, borderRadius: 45 }}
                onPress={() => {
                  Keyboard.dismiss();
                  this.setState({ showAddTicket: false });
                  this.setState({ showFab: true });
                }}
              >
                CANCEL
              </Button>
            </ModalContent>
          </Modal.BottomModal>

          <Modal.BottomModal
            visible={this.state.showUpdateTicket}
            animationDuration={300}
            overlayOpacity={0.8}
            onSwipeOut={() => this.setState({ showUpdateTicket: false })}
            onTouchOutside={() => this.setState({ showUpdateTicket: false })}
          >
            <ModalContent
              style={{
                backgroundColor: "fff",
                bottom: 0,
                padding: 300,
                height: 520,
              }}
            >
              <Avatar
                rounded
                source={require("./assets/images/cars/key.jpg")}
                size="large"
                left={"40%"}
              />

              <Text
                style={{
                  fontSize: 40,
                  color: "#693e94",
                  textAlign: "center",
                  letterSpacing: -3,
                  bottom: 0,
                }}
              >
                UPDATE TICKET
              </Text>

              <TextInput
                mode="outlined"
                placeholder="Ticket Number (Required)"
                value={this.state.updateTicketNum}
                editable={false}
              />

              <TextInput
                mode="outlined"
                onChangeText={(text) => this.setState({ updateMake: text })}
                label="Vehicle Make (Optional)"
                value={this.state.updateMake}
              />

              <TextInput
                mode="outlined"
                onChangeText={(text) => this.setState({ updateModel: text })}
                label="Vehicle Model (Optional)"
                value={this.state.updateModel}
              />

              <Text style={{ fontSize: 13, color: "gray", letterSpacing: 0 }}>
                {"\n"}This ticket was last updated on{" "}
                {moment(this.state.lastUpdate).format("MMM DD, YYYY h:mm:ss A")}
                .
              </Text>

              <Button
                mode="contained"
                style={{ marginTop: 20, borderRadius: 45 }}
                onPress={() => {
                  Keyboard.dismiss();
                  Alert.alert(
                    "Confirm Ticket Update",
                    "Are you sure you want to update this ticket?",
                    [
                      {
                        text: "Cancel",
                        cancelable: false,
                      },
                      {
                        text: "Update",
                        onPress: () => {
                          this.setState({ showUpdateTicket: false }),
                            this.updateTicketDetails(
                              this.state.updateTicketNum,
                              this.state.updateMake,
                              this.state.updateModel
                            );
                        },
                        cancelable: false,
                      },
                    ],
                    { cancelable: false }
                  );
                  this.setState({ showFab: true });
                }}
              >
                UPDATE TICKET
              </Button>

              <Button
                mode="contained"
                style={{ marginTop: 10, borderRadius: 45 }}
                onPress={() => {
                  this.setState({ showUpdateTicket: false });
                  this.setState({ showFab: true });
                }}
              >
                CANCEL
              </Button>
            </ModalContent>
          </Modal.BottomModal>

          <FloatingAction
            actions={actionButtons}
            visible={this.state.showFab}
            onPressItem={(name) => {
              if (name == "scan_barcode") {
                this.props.navigation.navigate("BarcodeScanner");
              }
              if (name == "add_ticket") {
                this.setState({ showFab: false });
                this.setState({ showAddTicket: true });
              }
            }}
            buttonSize={80}
            color={"#e04a2f"}
            style={{ position: "absolute" }}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

class Settings extends React.Component {
  checkUser = async () => {
    let user = await Auth.currentUserInfo();
    const now = moment();
    Alert.alert(
      "Current User Information",
      "\nUsername: " +
        user.attributes.email +
        "\n\nShift Start Time: " +
        shiftStart +
        "\n\nCurrent Shift Length:\n" +
        moment.duration(now.diff(shiftStart)).humanize(),
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel"),
          cancelable: true,
        },
      ],
      { cancelable: false }
    );
  };

  render() {
    return (
      <View style={{ backgroundColor: "white", flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              height: 300,
              borderBottomWidth: 1,
              borderBottomColor: "#dddddd",
              backgroundColor: "white",
            }}
          >
            <Image
              source={logo}
              style={{
                alignSelf: "center",
                top: "20%",
                height: Dimensions.get("screen").height / 4,
                width: Dimensions.get("screen").height / 4,
              }}
            />
          </View>
          <ScrollView>
            <ListItem
              Component={TouchableScale}
              friction={80}
              tension={100}
              activeScale={0.85}
              title={"Log Out"}
              titleStyle={{ fontSize: 30 }}
              leftAvatar={{
                source: require("./assets/icons/log_out.png"),
                rounded: false,
                tintColor: "#2f95dc",
              }}
              subtitle={"Click here to log out of Valeteque"}
              onPress={() => {
                Alert.alert(
                  "Log Out",
                  "Are you sure you want to log out of the session?",
                  [
                    {
                      text: "Cancel",
                      cancelable: false,
                    },
                    {
                      text: "Log Out",
                      onPress: () => {
                        (paidCount = 0), (freeCount = 0), Auth.signOut();
                      },
                      cancelable: false,
                    },
                  ],
                  { cancelable: false }
                );
              }}
              style={styles.listItemStyle}
              bottomDivider
              chevron
            ></ListItem>
            <ListItem
              Component={TouchableScale}
              friction={80}
              tension={100}
              activeScale={0.85}
              title={"Shift Report"}
              titleStyle={{ fontSize: 30 }}
              leftAvatar={{
                source: require("./assets/icons/report.png"),
                rounded: false,
                tintColor: "#2f95dc",
              }}
              subtitle={"Click here to view your current shift summary"}
              onPress={() => this.props.navigation.navigate("ShiftReport")}
              style={styles.listItemStyle}
              bottomDivider
              chevron
            ></ListItem>
            <ListItem
              Component={TouchableScale}
              friction={80}
              tension={100}
              activeScale={0.85}
              title={"User Information"}
              titleStyle={{ fontSize: 30 }}
              leftAvatar={{
                source: require("./assets/icons/user.png"),
                rounded: false,
                tintColor: "#2f95dc",
              }}
              subtitle={"Click here to view the current user"}
              onPress={() => {
                this.checkUser().toString();
              }}
              style={styles.listItemStyle}
              bottomDivider
              chevron
            ></ListItem>
          </ScrollView>
        </View>
      </View>
    );
  }
}

class BarcodeScanner extends React.Component {
  static navigationOptions = {
    title: "Barcode Scanner",
    headerShown: true,
    headerStyle: { backgroundColor: "#e04a2f" },
    headerTintColor: "white",
  };

  render() {
    return <Barcode />;
  }
}

class ShiftReport extends React.Component {
  static navigationOptions = {
    title: "Shift Report",
    headerShown: true,
    headerStyle: { backgroundColor: "#e04a2f" },
    headerTintColor: "white",
  };

  render() {
    const totalDollars = paidCount * 7;
    const chart_wh = 350;
    const series = [paidCount, freeCount];
    const sliceColor = ["#e04a2f", "#613d94"];
    return (
      <View>
        <PieChart
          chart_wh={chart_wh}
          style={{ alignSelf: "center", top: "8%" }}
          series={series}
          sliceColor={sliceColor}
          doughnut={true}
          coverRadius={0.45}
          coverFill={"#FFF"}
        />

        <ListItem
          Component={TouchableScale}
          friction={80}
          tension={100}
          activeScale={0.85}
          title={"Shift Start Time"}
          subtitle={shiftStart}
          titleStyle={{ fontSize: 20 }}
          style={styles.shiftReportStyle}
          bottomDivider
        ></ListItem>
        <ListItem
          Component={TouchableScale}
          friction={80}
          tension={100}
          activeScale={0.85}
          title={"Paid Tickets"}
          leftAvatar={{ backgroundColor: "#e04a2f" }}
          titleStyle={{ fontSize: 20 }}
          badge={{
            value: paidCount,
            scaleX: 2,
            scaleY: 2,
            width: 40,
            right: "30%",
          }}
          style={styles.shiftReportStyle}
          bottomDivider
        ></ListItem>
        <ListItem
          Component={TouchableScale}
          friction={80}
          tension={100}
          activeScale={0.85}
          title={"Free Tickets"}
          leftAvatar={{ backgroundColor: "#613d94" }}
          titleStyle={{ fontSize: 20 }}
          badge={{
            value: freeCount,
            scaleX: 2,
            scaleY: 2,
            width: 40,
            right: "30%",
          }}
          style={styles.shiftReportStyle}
          bottomDivider
        ></ListItem>
        <ListItem
          Component={TouchableScale}
          friction={80}
          tension={100}
          activeScale={0.85}
          title={"Total Cash Deposit"}
          titleStyle={{ fontSize: 20 }}
          badge={{
            value: "$" + totalDollars.toFixed(2),
            scaleX: 3.2,
            scaleY: 3.2,
            width: 60,
            right: "90%",
          }}
          subtitle={"Total of all cash transactions:"}
          style={styles.shiftReportStyle}
          bottomDivider
        ></ListItem>
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
          <View style={{ flex: 1 }}>
            <FontAwesome name="home" size={25} color={tintColor} />
          </View>
        ),
      },
    },
    Settings: {
      screen: Settings,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome name="user-circle" size={25} color={tintColor} />
        ),
      },
    },
  },
  {
    initialRouteName: "Home",
    tabBarOptions: {
      activeTintColor: "#e04a2f",
      keyboardHidesTabBar: "false",
    },
  }
);

const screenStackNavigator = createStackNavigator(
  {
    BarcodeScanner: {
      screen: BarcodeScanner,
    },
    ShiftReport: {
      screen: ShiftReport,
    },
    BottomTabNavigator: {
      screen: bottomTabNavigator,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: "BottomTabNavigator",
  }
);

class MyGreetings extends Greetings {
  render() {
    return (
      <View style={globalStyles.imageContainer}>
        <Image source={logo} style={globalStyles.image} />
      </View>
    );
  }
}

const AppContainer = createAppContainer(screenStackNavigator);

const actionButtons = [
  {
    text: "Add Ticket",
    icon: require("./assets/icons/add_ticket.png"),
    name: "add_ticket",
    position: 1,
    color: "#e04a2f",
    buttonSize: 60,
  },
  {
    text: "Scan Barcode",
    icon: require("./assets/icons/barcode.png"),
    name: "scan_barcode",
    position: 2,
    color: "#e04a2f",
    buttonSize: 60,
  },
];

export default withAuthenticator(
  App,
  false,
  [
    <MyGreetings />,
    <ConfirmSignIn />,
    <ConfirmSignUp />,
    <ForgotPassword />,
    <RequireNewPassword />,
    <SignIn />,
    <SignUp />,
    <VerifyContact />,
  ],
  null,
  MyTheme
);
