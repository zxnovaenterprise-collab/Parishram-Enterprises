import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, X, Upload, ShieldAlert, SwitchCamera, Image as ImageIcon } from 'lucide-react';
import { DocumentType } from '../types';

interface CameraCaptureModalProps {
  documentType: DocumentType;
  onCaptureComplete: (frontImage: string, backImage: string | null) => void;
  onClose: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  documentType,
  onCaptureComplete,
  onClose,
}) => {
  const [step, setStep] = useState<'front' | 'back' | 'review'>('front');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Default to front camera for Profile Photo, rear camera for documents
  const initialFacing: 'user' | 'environment' = documentType === 'Profile Photo' ? 'user' : 'environment';
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(initialFacing);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Progressive camera constraints for high mobile compatibility
  const getMediaStream = async (facing: 'user' | 'environment'): Promise<MediaStream> => {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (err1) {
      console.warn('Attempt 1 ideal constraints failed, trying basic facingMode:', err1);
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
      } catch (err2) {
        console.warn('Attempt 2 basic facingMode failed, trying generic video:', err2);
        return await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }
    }
  };

  // Initialize camera stream
  const startCamera = async (facing: 'user' | 'environment' = facingMode) => {
    try {
      setIsLoadingCamera(true);
      setCameraError(null);

      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC camera API is not supported on this browser context.');
      }

      const mediaStream = await getMediaStream(facing);
      setStream(mediaStream);
      setIsLoadingCamera(false);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable or permission denied on this device. You can choose or capture an image file directly.');
      setIsLoadingCamera(false);
    }
  };

  useEffect(() => {
    startCamera(initialFacing);
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Attach stream to video element reliably whenever video element or stream updates
  useEffect(() => {
    if (videoRef.current && stream && step !== 'review') {
      const video = videoRef.current;
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('autoplay', 'true');
      video.setAttribute('muted', 'true');

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Video play interrupted:', err);
        });
      }
    }
  }, [stream, step]);

  // Switch camera front/rear
  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Capture snapshot from video stream
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      if (step === 'front') {
        setFrontImage(dataUrl);
        if (documentType === 'Aadhaar Card') {
          setStep('back');
        } else {
          setStep('review');
          stopStream();
        }
      } else if (step === 'back') {
        setBackImage(dataUrl);
        setStep('review');
        stopStream();
      }
    }
  };

  // File Upload Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (step === 'front') {
        setFrontImage(dataUrl);
        if (documentType === 'Aadhaar Card') {
          setStep('back');
        } else {
          setStep('review');
          stopStream();
        }
      } else if (step === 'back') {
        setBackImage(dataUrl);
        setStep('review');
        stopStream();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmSave = () => {
    if (frontImage) {
      onCaptureComplete(frontImage, backImage);
      onClose();
    }
  };

  const handleRetakeAll = () => {
    setFrontImage(null);
    setBackImage(null);
    setStep('front');
    startCamera(facingMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden text-white flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-100">{documentType} Capture</h3>
              <p className="text-[11px] text-slate-400">
                {step === 'front' && 'Step 1: Capture Front Side'}
                {step === 'back' && 'Step 2: Capture Back Side'}
                {step === 'review' && 'Review Captured Image'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            id="btn-close-camera"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center min-h-[300px]">
          {step !== 'review' ? (
            <div className="w-full flex flex-col items-center">
              {/* Camera Live Stream Box */}
              {!cameraError ? (
                <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-blue-500/40 shadow-2xl flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {isLoadingCamera && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-xs text-blue-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                      <span>Accessing Camera Stream...</span>
                    </div>
                  )}

                  {/* Document Alignment Frame */}
                  <div className="absolute inset-3 sm:inset-4 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-2 sm:p-3">
                    <div className="flex justify-between text-[9px] text-emerald-300 font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                      <span>{documentType.toUpperCase()}</span>
                      <span>{step.toUpperCase()} SIDE</span>
                    </div>
                    <div className="text-center text-[11px] text-white font-semibold bg-black/60 py-1 px-2 rounded backdrop-blur self-center">
                      {documentType === 'Profile Photo'
                        ? 'Align face in center'
                        : `Align ${step === 'front' ? 'FRONT' : 'BACK'} side within frame`}
                    </div>
                  </div>

                  {/* Switch Front/Rear Camera Button */}
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    title="Switch Camera (Front/Rear)"
                    className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-xl hover:bg-slate-800 border border-slate-700 cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    <SwitchCamera className="w-4 h-4 text-blue-400" />
                  </button>
                </div>
              ) : (
                /* Camera Error / Fallback Box */
                <div className="w-full max-w-sm bg-slate-800/60 border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3">
                  <ShieldAlert className="w-10 h-10 text-amber-400" />
                  <p className="text-xs font-medium text-slate-300">
                    {cameraError || 'Camera stream offline.'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    You can snap a photo directly using your phone's camera or choose a file from gallery.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
                    <button
                      type="button"
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo with Phone
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Gallery File
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons below Camera Stream */}
              {!cameraError && (
                <div className="mt-5 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
                  <button
                    type="button"
                    onClick={captureSnapshot}
                    disabled={isLoadingCamera}
                    id={`btn-capture-${step}`}
                    className="w-full sm:flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    Capture {step === 'front' ? 'Front Side' : 'Back Side'}
                  </button>

                  <button
                    type="button"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    Upload File
                  </button>
                </div>
              )}

              {/* Native Mobile Inputs */}
              <input
                ref={nativeCameraInputRef}
                type="file"
                accept="image/*"
                capture={documentType === 'Profile Photo' ? 'user' : 'environment'}
                className="hidden"
                onChange={handleFileUpload}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            /* Review Step */
            <div className="w-full flex flex-col items-center gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {/* Front Side Preview */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase">Front Image</span>
                  {frontImage ? (
                    <img src={frontImage} alt="Front Side" className="w-full h-36 object-contain rounded-lg bg-black/40 border border-slate-800" />
                  ) : (
                    <div className="w-full h-36 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 text-xs">No image</div>
                  )}
                </div>

                {/* Back Side Preview if Aadhaar */}
                {documentType === 'Aadhaar Card' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase">Back Image</span>
                    {backImage ? (
                      <img src={backImage} alt="Back Side" className="w-full h-36 object-contain rounded-lg bg-black/40 border border-slate-800" />
                    ) : (
                      <div className="w-full h-36 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 text-xs">No image</div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 w-full">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Captured successfully! Image is ready to attach to worker record.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleRetakeAll}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset / Retake
          </button>

          {step === 'review' && (
            <button
              type="button"
              onClick={handleConfirmSave}
              id="btn-confirm-doc-save"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Document to Form
            </button>
          )}
        </div>

        {/* Hidden Canvas for Video Frame Processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
