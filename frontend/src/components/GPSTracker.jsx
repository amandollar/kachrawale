import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';

const GPSTracker = ({ pickupId }) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !pickupId) return;

    // Emit initial "start" message or just start streaming
    console.log("Starting GPS Tracking for pickup:", pickupId);

    const success = (position) => {
      const { latitude, longitude, heading, speed } = position.coords;
      
      const payload = {
        pickupId,
        lat: latitude,
        lng: longitude,
        heading: heading || 0,
        speed: speed || 0
      };

      console.log("Emitting location:", payload);
      socket.emit('update_location', payload);
    };

    const error = (err) => {
      console.error("GPS Error:", err);
      toast.error("GPS Error: Enable location for tracking");
    };

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    };

    const watchId = navigator.geolocation.watchPosition(success, error, options);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      console.log("Stopped GPS Tracking");
    };
  }, [socket, pickupId]);

  return null; // Invisible component
};

export default GPSTracker;
