import React, {useRef, useState, useEffect} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Platform} from 'react-native';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
} from 'react-native-agora';
import AgoraUIKit from 'agora-rn-uikit';

import styles from './Style';
import requestCameraAndAudioPermission from './Permission';

function App() {
  const agoraKitRef = React.useRef();
  const [videoCall, setVideoCall] = useState(false);
  const connectionData = {
    appId: '07191c1f4630420f957d849263b20a67',
    token:
      '007eJxSYMhpn7L0ZE+9u3ly2xXFCx8e90m85fs1b4WlxirVngvHWPsUGAzMDS0Nkw3TTMyMDUyMDNIsTc1TLEwsjcyMk4wMEs3Mo3a+SU14xcBw+lc3KyMDIwMLAyMDiM8EJpnBJAuUDEktLmFgAAQAAP//Lb8lhQ==',
    channelName: 'Test',
    uid: 0,
  };
  const rtcCallbacks = {
    EndCall: () => setVideoCall(false),
  };

  const agoraEngineRef = useRef();
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [message, setMessage] = useState('');
  const [peerIds, setPeerIds] = useState([]);

  function showMessage(msg) {
    setMessage(msg);
  }

  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      agoraEngineRef.current?.startPreview();
      agoraEngineRef.current?.joinChannel(
        connectionData.token,
        connectionData.channelName,
        connectionData.uid,
        {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        },
      );
    } catch (e) {
      console.log(e);
    }
  };

  const leave = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      setPeerIds([]);

      showMessage('You left the channel');
    } catch (e) {
      console.log(e);
    }
  };

  const setupVideoSDKEngine = async () => {
    try {
      if (Platform.OS === 'android') {
        await requestCameraAndAudioPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          showMessage(
            'Successfully joined the channel ' + connectionData.channelName,
          );
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          showMessage('Remote user joined with uid ' + Uid);
          if (peerIds.indexOf(Uid) === -1) {
            setPeerIds(prev => [...prev, Uid]);
          }
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user left the channel. uid: ' + Uid);
          setPeerIds(prev => prev.filter(id => id !== Uid));
          setRemoteUid(0);
        },
      });
      agoraEngine.initialize({
        appId: connectionData.appId,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      agoraEngine.enableVideo();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    // Initialize Agora engine when the app starts
    setupVideoSDKEngine();
  }, []);

  return videoCall ? (
    <AgoraUIKit connectionData={connectionData} rtcCallbacks={rtcCallbacks} />
  ) : (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightblue',
      }}>
      <Text
        onPress={async () => {
          await join();
          setVideoCall(true);
        }}>
        Join Group Call
      </Text>
    </View>
  );
}

export default App;

// ** Below code is for without UIKit

// const _renderVideos = () => {
//   return isJoined ? (
//     <View style={styles.fullView}>
//       <RtcSurfaceView canvas={{uid: 0}} style={styles.max} />
//       {_renderRemoteVideos()}
//     </View>
//   ) : null;
// };

// const _renderRemoteVideos = () => {
//   return (
//     <ScrollView
//       style={styles.remoteContainer}
//       contentContainerStyle={styles.padding}
//       horizontal={true}>
//       {peerIds.map(value => {
//         return (
//           <React.Fragment key={remoteUid}>
//             <RtcSurfaceView canvas={{uid: remoteUid}} style={styles.remote} />
//             <Text>Remote user uid: {remoteUid}</Text>
//           </React.Fragment>
//         );
//       })}
//     </ScrollView>
//   );
// };

// <SafeAreaView style={styles.main}>
//   <Text style={styles.head}>Agora Video Calling Quickstart</Text>
//   <View style={styles.btnContainer}>
//     <Text onPress={join} style={styles.button}>
//       Join
//     </Text>
//     <Text onPress={leave} style={styles.button}>
//       Leave
//     </Text>
//   </View>
//   <ScrollView
//     style={styles.scroll}
//     contentContainerStyle={styles.scrollContainer}>
//     {isJoined ? (
//       <React.Fragment key={0}>
//         <RtcSurfaceView canvas={{uid: 0}} style={styles.videoView} />
//         <Text>Local user uid: {connectionData.uid}</Text>
//       </React.Fragment>
//     ) : (
//       <Text>Join a channel</Text>
//     )}
//     {isJoined && remoteUid !== 0 ? (
//       <React.Fragment key={remoteUid}>
//         <RtcSurfaceView
//           canvas={{uid: remoteUid}}
//           style={styles.videoView}
//         />
//         <Text>Remote user uid: {remoteUid}</Text>
//       </React.Fragment>
//     ) : (
//       <Text>Waiting for a remote user to join</Text>
//     )}
//     <Text style={styles.info}>{message}</Text>

//     {/* {_renderVideos()} */}
//   </ScrollView>
// </SafeAreaView>
