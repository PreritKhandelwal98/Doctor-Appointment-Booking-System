import { useEffect, useCallback, useState, useRef, useContext } from "react";
import ReactPlayer from "react-player";
import peer from '../../../utils/peer';
import io from 'socket.io-client';
import { useParams,useLocation } from "react-router-dom";
import Prescription from "../Prescriptions/Prescription";
import { authContext } from "../../../context/authContext";
const VirtualMeeting = () => {
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [callActive, setCallActive] = useState(false); // Track if the call is active
  const [videoEnabled, setVideoEnabled] = useState(true); // Track if video is enabled
  const [audioEnabled, setAudioEnabled] = useState(true); // Track if audio is enabled
  const socket = useRef(null); 

  const {id} = useParams()
  const location = useLocation();
  const { appointment } = location.state || {};
  //console.log("this is room id",id);
  const roomId = id ;
  //const roomId  = '66fa24065494782ccfef43e4'; // Get the roomId (or appointmentId) from location

  
  const { user } = useContext(authContext);
  //console.log("appointment",appointment);
  

  useEffect(() => {
    // Initialize socket connection
    socket.current = io('http://localhost:5600/', {
      transports: ['websocket'],
      path: '/socket.io',
    });

    socket.current.on("connect", () => {
      console.log("Connected to server with ID:", socket.current.id);
      // Join the specific room by emitting 'room:join' event
      socket.current.emit("room:join", { roomId });
    });

    socket.current.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.current.off("connect");
      socket.current.off("disconnect");
    };
  }, [roomId]);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.current.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
    setCallActive(true); // Set call active state to true
  }, [remoteSocketId]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.current.emit("call:accepted", { to: from, ans });
      setCallActive(true); // Set call active state to true
    },
    []
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleEndCall = useCallback(() => {
    // Stop all tracks for the local stream
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    // Reset states
    setMyStream(null);
    setRemoteStream(null);
    setRemoteSocketId(null);
    setCallActive(false); // Set call active state to false
  }, [myStream]);

  const toggleVideo = useCallback(() => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled; // Toggle video track
      setVideoEnabled(videoTrack.enabled); // Update state
    }
  }, [myStream]);

  const toggleAudio = useCallback(() => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled; // Toggle audio track
      setAudioEnabled(audioTrack.enabled); // Update state
    }
  }, [myStream]);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.current.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.current.emit("peer:nego:done", { to: from, ans });
    },
    []
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.current.on("user:joined", handleUserJoined);
    socket.current.on("incoming:call", handleIncomingCall);
    socket.current.on("call:accepted", handleCallAccepted);
    socket.current.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.current.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.current.off("user:joined", handleUserJoined);
      socket.current.off("incoming:call", handleIncomingCall);
      socket.current.off("call:accepted", handleCallAccepted);
      socket.current.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.current.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Virtual Meeting for Appointment ID: {roomId}</h1>
      <h4>{remoteSocketId ? "Connected" : "Waiting for patient to join to start the call"}</h4>      
      <div className="flex w-full max-w-6xl h-[60vh] space-x-4">
        {/* Local Stream */}
        <div className="w-1/2 flex flex-col items-center relative">
          {remoteSocketId && myStream && (
            <>
              <ReactPlayer
                playing
                height="100%"
                width="100%"
                className="rounded-lg shadow-lg border border-gray-300 bg-black"
                url={myStream}
              />
              <p className="mt-2 font-semibold">Your Video</p>
            </>
          )}
        </div>

        {/* Remote Stream */}
        <div className="w-1/2 flex flex-col items-center relative">
          {remoteSocketId && remoteStream ? (
            <>
              <ReactPlayer
                playing
                muted
                height="100%"
                width="100%"
                className="rounded-lg shadow-lg border border-gray-300 bg-black"
                url={remoteStream}
              />
              <p className="mt-2 font-semibold">Remote Video</p>
            </>
          ) : (
            remoteSocketId && <p className="text-lg text-red-500">Waiting for the other participant...</p>
          )}
        </div>
      </div>

      {/* Call Button */}
      {remoteSocketId && !callActive && (
        <button onClick={handleCallUser} className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-md shadow hover:bg-blue-500 transition-all duration-200">
          CALL
        </button>
      )}

      {/* End Call Button */}
      {callActive && (
        <button onClick={handleEndCall} className="mt-6 px-6 py-3 bg-red-600 text-white font-bold rounded-md shadow hover:bg-red-500 transition-all duration-200">
          END CALL
        </button>
      )}

      {/* Video and Audio Toggle Buttons */}
      {callActive && (
        <div className="mt-4 flex space-x-4">
          <button onClick={toggleVideo} className={`px-4 py-2 ${videoEnabled ? 'bg-green-600' : 'bg-gray-400'} text-white font-bold rounded-md`}>
            {videoEnabled ? "TURN OFF VIDEO" : "TURN ON VIDEO"}
          </button>
          <button onClick={toggleAudio} className={`px-4 py-2 ${audioEnabled ? 'bg-green-600' : 'bg-gray-400'} text-white font-bold rounded-md`}>
            {audioEnabled ? "MUTE" : "UNMUTE"}
          </button>
        </div>
      )}

      
        <Prescription user={user} appointment={appointment}/>
      
    </div>
  );
};

export default VirtualMeeting;
