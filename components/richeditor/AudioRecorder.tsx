import React, { useState, useRef, useEffect } from "react";
import {
  FaMicrophone,
  FaStop,
  FaPlay,
  FaPause,
  FaTrash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { IconButton } from "./IconButton"; // Assuming IconButton is in the same directory or correctly pathed
import WaveSurfer from "wavesurfer.js";

interface AudioRecorderProps {
  onAudioSave: (audioBlob: Blob, audioUrl: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioSave,
  onCancel,
  isVisible,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [hasRecording, setHasRecording] = useState(false);
  const [isWaveformLoading, setIsWaveformLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferInstanceRef = useRef<WaveSurfer | null>(null);
const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop(); // This will trigger onstop
        setIsRecording(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null; // Release the stream
        }
      }
    };
  useEffect(() => {
    const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop(); // This will trigger onstop
        setIsRecording(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null; // Release the stream
        }
      }
    };
    if (!isVisible) {
      // Perform cleanup but preserve recording if user just hides the modal
      if (isRecording) {
        stopRecording(); // This will also handle stream/interval cleanup related to recording
      }
      // Destroy wavesurfer if it exists and modal is hidden
      if (wavesurferInstanceRef.current) {
        wavesurferInstanceRef.current.destroy();
        wavesurferInstanceRef.current = null;
      }
      setIsPlaying(false); // Stop playback if modal is hidden
    }
  }, [isVisible, isRecording]); // Added isRecording

  // General cleanup on unmount
  useEffect(() => {
    const generalCleanup = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        // setAudioUrl(''); // Keep URL if component might become visible again with same recording
      }
      if (wavesurferInstanceRef.current) {
        wavesurferInstanceRef.current.destroy();
        wavesurferInstanceRef.current = null;
      }
      setIsRecording(false);
      // Don't reset audioBlob/audioUrl here if you want to keep the recording data
      // until explicitly deleted or saved.
    };
    return () => {
      generalCleanup();
      if (audioUrl) URL.revokeObjectURL(audioUrl); // Full cleanup on unmount
    };
  }, [audioUrl]); // Rerun if audioUrl changes to revoke old one

  // Initialize Wavesurfer when a recording is available
  useEffect(() => {
    if (hasRecording && audioUrl && waveformRef.current && audioRef.current) {
      if (wavesurferInstanceRef.current) {
        wavesurferInstanceRef.current.destroy();
      }
      setIsWaveformLoading(true);

      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "rgb(180, 180, 180)", // Lighter wave color
        progressColor: "rgb(239, 68, 68)", // Tailwind's red-500 for progress
        height: 80,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        media: audioRef.current, // Use the existing audio element
        // url: audioUrl, // Alternative if not using 'media'
      });
      wavesurferInstanceRef.current = ws;

      ws.on("ready", () => {
        setIsWaveformLoading(false);
      });
      ws.on("play", () => setIsPlaying(true));
      ws.on("pause", () => setIsPlaying(false));
      ws.on("finish", () => {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.currentTime = 0;
      });
      ws.on("error", (e) => {
        console.error("Wavesurfer error:", e);
        setIsWaveformLoading(false);
      });

      // If audioRef already has src, Wavesurfer with 'media' option should pick it up.
      // If not, uncomment:
      // ws.load(audioUrl);
    } else {
      // Ensure Wavesurfer is destroyed if conditions are not met (e.g., recording deleted)
      if (wavesurferInstanceRef.current) {
        wavesurferInstanceRef.current.destroy();
        wavesurferInstanceRef.current = null;
      }
    }

    // This effect's cleanup should specifically handle the wavesurfer instance it created
    return () => {
      // This might be redundant if generalCleanup handles it, but good for focused cleanup
      // wavesurferInstanceRef.current?.destroy();
      // wavesurferInstanceRef.current = null;
    };
  }, [hasRecording, audioUrl]); // Only re-run if recording state or URL changes

  const startRecording = async () => {
    // Clear previous recording first
    deleteRecording(true); // Pass a flag to prevent full UI reset if desired

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const options = { mimeType: "audio/webm" }; // webm is widely supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn(
          `${options.mimeType} is not Supported! Falling back to default.`
        );
        options.mimeType = ""; // Fallback to browser default
      }
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: options.mimeType || "audio/wav",
        }); // Use actual mimeType
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setHasRecording(true);
        // audioRef.current will pick up the new src via its `src={audioUrl}` prop.
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      intervalRef.current = setInterval(
        () => setRecordingTime((prev) => prev + 1),
        1000
      );
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(
        "Could not access microphone. Please ensure permissions are granted."
      );
    }
  };

  const togglePlayPause = () => {
    if (wavesurferInstanceRef.current) {
      wavesurferInstanceRef.current.playPause();
    } else if (audioRef.current) {
      // Fallback if wavesurfer not ready (should not happen in normal flow with hasRecording)
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
  };

  const deleteRecording = (isStartingNewRecording = false) => {
    if (wavesurferInstanceRef.current) {
      wavesurferInstanceRef.current.destroy();
      wavesurferInstanceRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl("");
    setHasRecording(false);
    if (!isStartingNewRecording) {
      // Only reset time if not immediately starting new rec.
      setRecordingTime(0);
    }
    setIsPlaying(false);
  };

  const saveRecording = () => {
    if (audioBlob && audioUrl) {
      onAudioSave(audioBlob, audioUrl); // Pass the blob and the local URL
      deleteRecording(); // Reset after saving
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // This is handled by wavesurfer's 'finish' event now if linked correctly
  // const handleAudioEnd = () => {
  //   setIsPlaying(false);
  // };

  if (!isVisible) return null;

  return (
    <div className="sticky inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="border border-gray-300 rounded-lg p-4 sm:p-6 bg-white shadow-xl w-full max-w-md">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Audio Recorder
            </h3>
            <IconButton
              onClick={() => {
                if (isRecording) stopRecording(); // Ensure recording stops if modal is closed
                onCancel();
              }}
              icon={FaTimes}
              title="Close"
              className="text-gray-500 hover:text-gray-700"
            />
          </div>

          {!hasRecording && !isRecording && (
            <button
              onClick={startRecording}
              className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-colors w-full text-base"
            >
              <FaMicrophone size={18} />
              <span>Start Recording</span>
            </button>
          )}

          {isRecording && (
            <>
              <button
                onClick={stopRecording}
                className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 rounded-lg transition-colors w-full text-base"
              >
                <FaStop size={18} />
                <span>Stop Recording</span>
              </button>
              <div className="text-center py-2">
                <div className="text-3xl font-mono text-red-500">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-sm text-gray-500">Recording...</div>
              </div>
            </>
          )}

          {hasRecording && (
            <div className="space-y-3 pt-2">
              {/* Waveform display area */}
              <div
                ref={waveformRef}
                className={`waveform-container rounded ${isWaveformLoading ? "bg-gray-100 h-[80px] flex items-center justify-center" : ""}`}
              >
                {isWaveformLoading && (
                  <span className="text-gray-500 text-sm">
                    Loading waveform...
                  </span>
                )}
              </div>

              {/* Audio element: src is set, Wavesurfer uses this via `media` option. Hide native controls. */}
              <audio
                ref={audioRef}
                src={audioUrl}
                // onEnded={handleAudioEnd} // Wavesurfer 'finish' event handles this
                className="hidden" // Hide, as Wavesurfer and custom buttons control it
              />

              <div className="flex items-center justify-center space-x-3">
                <IconButton
                  onClick={togglePlayPause}
                  icon={isPlaying ? FaPause : FaPlay}
                  title={isPlaying ? "Pause" : "Play"}
                  className={`p-3 rounded-full ${isPlaying ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  iconSize={18}
                />
                <IconButton
                  onClick={() => deleteRecording()}
                  icon={FaTrash}
                  title="Delete"
                  className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                  iconSize={18}
                />
                <button
                  onClick={saveRecording}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg transition-colors text-sm"
                >
                  <FaCheck size={16} />
                  <span>Save Audio</span>
                </button>
              </div>
            </div>
          )}

          {!hasRecording && !isRecording && (
            <div className="text-center text-gray-500 text-sm pt-2">
              Click Start Recording to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
