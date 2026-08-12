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
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera
  const startCamera = async (facing: 'user' | 'environment' = facingMode) => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable or permission denied. You can upload image files directly instead.');
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera('environment');
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Switch camera front/rear
  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      if (step === 'front') {
        setFrontImage(dataUrl);
        if (documentType === 'Aadhaar Card') {
          setStep('back');
        } else {
          // PAN card only requires front side
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

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
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
        }
      } else if (step === 'back') {
        setBackImage(dataUrl);
        setStep('review');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">{documentType} Capture</h3>
              <p className="text-xs text-slate-400">
                {step === 'front' && 'Step 1: Position Front Side of document'}
                {step === 'back' && 'Step 2: Position Back Side of document'}
                {step === 'review' && 'Review Captured Images'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            id="btn-close-camera"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center min-h-[350px]">
          {step !== 'review' ? (
            <div className="w-full flex flex-col items-center">
              {/* Camera Container */}
              {isCameraActive && !cameraError ? (
                <div className="relative w-full max-w-md aspect-[4/3] bg-black rounded-xl overflow-hidden border-2 border-blue-500/40 shadow-inner flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Framing Overlay Guide */}
                  <div className="absolute inset-4 border-2 border-dashed border-emerald-400/80 rounded-lg pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between text-[10px] text-emerald-300 font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                      <span>{documentType.toUpperCase()} - {step.toUpperCase()} SIDE</span>
                      <span>ALIGN WITHIN FRAME</span>
                    </div>
                    <div className="text-center text-xs text-white/90 font-medium bg-black/60 py-1 px-2 rounded backdrop-blur self-center">
                      {step === 'front' ? 'Align FRONT side of card' : 'Align BACK side of card'}
                    </div>
                  </div>

                  {/* Switch Camera Button */}
                  <button
                    onClick={toggleCameraFacing}
                    title="Switch Camera"
                    className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 border border-slate-700 cursor-pointer shadow-lg"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Camera Error or Fallback File Upload Area */
                <div className="w-full max-w-md bg-slate-800/60 border-2 border-dashed border-slate-700 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
                  <ShieldAlert className="w-10 h-10 text-amber-400" />
                  <p className="text-sm font-medium text-slate-300">
                    {cameraError || 'Camera stream unavailable.'}
                  </p>
                  <p className="text-xs text-slate-400">
                    You can select an image file directly from your device.
                  </p>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    id="btn-upload-doc-file"
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Image File
                  </button>
                </div>
              )}

              {/* Action Buttons below Camera */}
              {isCameraActive && !cameraError && (
                <div className="mt-6 flex items-center gap-4">
                  <button
                    onClick={captureSnapshot}
                    id={`btn-capture-${step}`}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Camera className="w-5 h-5" />
                    Capture {step === 'front' ? 'Front Side' : 'Back Side'}
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Upload File Instead
                  </button>
                </div>
              )}

              {/* Hidden File Input */}
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
            <div className="w-full flex flex-col items-center gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* Front Side Thumbnail */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-xs font-bold text-slate-400 block mb-2 uppercase">Front Side Image</span>
                  {frontImage ? (
                    <img src={frontImage} alt="Front Side" className="w-full h-40 object-contain rounded-lg bg-black/40 border border-slate-800" />
                  ) : (
                    <div className="w-full h-40 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 text-xs">No image</div>
                  )}
                </div>

                {/* Back Side Thumbnail */}
                {documentType === 'Aadhaar Card' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-xs font-bold text-slate-400 block mb-2 uppercase">Back Side Image</span>
                    {backImage ? (
                      <img src={backImage} alt="Back Side" className="w-full h-40 object-contain rounded-lg bg-black/40 border border-slate-800" />
                    ) : (
                      <div className="w-full h-40 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 text-xs">No image</div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirmation Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 w-full">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Document captured successfully! Both front and back side images are ready to be attached to the form.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleRetakeAll}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset / Retake
          </button>

          {step === 'review' && (
            <button
              onClick={handleConfirmSave}
              id="btn-confirm-doc-save"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Document to Form
            </button>
          )}
        </div>

        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
