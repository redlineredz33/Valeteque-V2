import React, { Component } from 'react';
import { StyleSheet, SafeAreaView, Modal, ActivityIndicator} from 'react-native';

const Loader = props => {
  const {
    loading,
    ...attributes
  } = props;

  return (
    <Modal
      transparent={true}
      animationType={'none'}
      visible={loading}
      onRequestClose={() => {console.log('close modal')}}>
      <SafeAreaView style={styles.modalBackground}>
        <SafeAreaView style={styles.activityIndicatorWrapper}>
          <ActivityIndicator
            animating={loading}
            size={"large"} />
        </SafeAreaView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000060'
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
  }
});

export default Loader;