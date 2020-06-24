import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  imageContainer: {
    flex: 0.7,
    width: "90%",
  },
  image: {
    alignSelf: "center",
    flex: 1,
    width: "100%",
    height: "20%",
  },
});

import { AmplifyTheme } from "aws-amplify-react-native";

const MySectionHeaderText = Object.assign(
  {},
  AmplifyTheme.MySectionHeaderText,
  { color: "#e04a2f", alignSelf: "center", fontSize: 16 }
);
const MyButton = Object.assign({}, AmplifyTheme.button, {
  backgroundColor: "#e04a2f",
  borderRadius: 35,
  padding: 20,
});
const MyDisabledButton = Object.assign({}, AmplifyTheme.buttonDisabled, {
  backgroundColor: "#e04a2f",
  borderRadius: 35,
  padding: 20,
});
const MySectionFooterLink = Object.assign({}, AmplifyTheme.sectionFooterLink, {
  color: "#e04a2f",
});

export const MyTheme = Object.assign({}, AmplifyTheme, {
  sectionHeaderText: MySectionHeaderText,
  button: MyButton,
  buttonDisabled: MyDisabledButton,
  sectionFooterLink: MySectionFooterLink,
});

export const styles = StyleSheet.create({
  badgeStyle: {
    position: "absolute",
    top: -4,
    right: -4,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
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
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addTicketContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingTop: 50,
  },
  addTicketInput: {
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: "blue",
    marginVertical: 10,
  },
  addTicketButtonContainer: {
    backgroundColor: "#34495e",
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addTicketButtonText: {
    color: "#fff",
    fontSize: 24,
  },
  mainContainer: {
    flex: 1,
    marginTop: 50,
    backgroundColor: "white",
  },
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  rectangleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  contentContainerStyle: {
    padding: 30,
    backgroundColor: "gray",
  },
  rectangle: {
    height: 300,
    width: 250,
    borderWidth: 2,
    borderColor: "#00FF00",
    backgroundColor: "white",
    shadowColor: "#000000",
    shadowOpacity: 5,
    shadowRadius: 50,
    shadowOffset: {
      height: 10,
      width: 10,
    },
    elevation: 20,
  },
  shiftReportStyle: {
    top: "15%",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    borderWidth: 1,
    borderColor: "#007BFF",
    backgroundColor: "#007BFF",
    padding: 15,
    margin: 5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    textAlign: "center",
  },
  item: {
    padding: 20,
    justifyContent: "center",
    backgroundColor: "white",
    alignItems: "center",
    marginVertical: 10,
  },
  header: {
    marginTop: 30,
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 20,
    backgroundColor: "white",
  },
  panelHandle: {
    width: 40,
    height: 2,
    backgroundColor: "gray",
    borderRadius: 4,
  },
  addButton: {
    backgroundColor: "#e04a2f",
    borderColor: "#e04a2f",
    borderWidth: 1,
    height: 90,
    width: 90,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
    shadowColor: "#000000",
    shadowOpacity: 5,
    shadowRadius: 50,
    shadowOffset: {
      height: 10,
      width: 0,
    },
    elevation: 5,
  },
  addButton2: {
    backgroundColor: "#e04a2f",
    borderColor: "#e04a2f",
    borderWidth: 1,
    height: 90,
    width: 90,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 700,
    right: 20,
    shadowColor: "#000000",
    shadowOpacity: 5,
    shadowRadius: 50,
    shadowOffset: {
      height: 10,
      width: 0,
    },
    elevation: 5,
  },
  header_footer_style: {
    width: "100%",
    height: 150,
    backgroundColor: "#F95959",
  },
  spinnerTextStyle: {
    color: "#FFF",
  },
});
