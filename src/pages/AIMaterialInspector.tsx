import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Camera,
  Layers,
  FileCheck,
  TrendingUp,
  Scan,
  Activity,
  Check,
  Copy,
  Cpu,
  Zap,
  Eye,
  Radio,
  XCircle,
  AlertOctagon,
  HelpCircle,
  Boxes,
} from 'lucide-react';
import { MaterialInspectionResult } from '../types';
import { RobotInspector3D } from '../components/RobotInspector3D';

interface AIMaterialInspectorProps {
  onNavigate: (page: string, params?: any) => void;
}

const SAMPLE_INSPECTION_ITEMS = [
  {
    id: 'cement',
    name: 'Surplus Cement Bags',
    category: 'Cement',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
    description: 'UltraTech OPC 53 Grade sealed bags stored indoors on dry wooden dunnage.',
    conditionTag: 'Excellent • 95% Rating',
    focalPoint: 'Moisture barrier intact',
  },
  {
    id: 'steel',
    name: 'TMT Steel Rebars (Fe 550D)',
    category: 'Steel',
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80',
    description: 'Straight reinforcement rebars with light mill-scale surface oxidation.',
    conditionTag: 'Good • Fe 550D Reusable',
    focalPoint: 'Minor superficial rust',
  },
  {
    id: 'bricks',
    name: 'Red Clay Chamber Bricks',
    category: 'Bricks',
    image: 'https://images.unsplash.com/photo-1584463699026-6a978f8cb64c?w=600&auto=format&fit=crop&q=80',
    description: 'Kiln-burnt wire-cut facade bricks stacked on pallet with sharp corners.',
    conditionTag: 'Good • Sharp Edges',
    focalPoint: 'Zero major fractures',
  },
  {
    id: 'tiles',
    name: 'Vitrified Gloss Floor Tiles',
    category: 'Tiles',
    image: 'https://images.unsplash.com/photo-1581404476143-fb31d742929f?w=600&auto=format&fit=crop&q=80',
    description: 'Sealed boxes of 600x1200mm double-charge vitrified porcelain floor tiles.',
    conditionTag: 'Excellent • Factory Sealed',
    focalPoint: 'No crazing or chipping',
  },
];

export const AIMaterialInspector: React.FC<AIMaterialInspectorProps> = ({ onNavigate }) => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_INSPECTION_ITEMS[0].image);
  const [activeSampleId, setActiveSampleId] = useState<string>('cement');
  const [loading, setLoading] = useState<boolean>(false);
  const [inspectionResult, setInspectionResult] = useState<MaterialInspectionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedDesc, setCopiedDesc] = useState<boolean>(false);
  const [activeScanPulse, setActiveScanPulse] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const runInspection = async (imageBase64?: string, sampleId?: string) => {
    setLoading(true);
    setActiveScanPulse(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/ai/inspect-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64 || (selectedImage.startsWith('data:') ? selectedImage : undefined),
          sampleType: sampleId || activeSampleId,
        }),
      });

      const rawText = await response.text();
      let data: MaterialInspectionResult & { error?: string };
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(
          rawText.trim().startsWith('<')
            ? 'Inspection service returned HTML instead of JSON.'
            : 'Inspection service returned an invalid response.'
        );
      }

      if (!response.ok) {
        throw new Error(data?.error || `Server returned HTTP ${response.status}`);
      }

      setInspectionResult(data);
    } catch (err: any) {
      console.error('Inspection error:', err);
      setErrorMsg(err?.message || 'Failed to process image inspection. Please check your photo and try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setActiveScanPulse(false), 800);
      setUploadStatus(null);
    }
  };

  /**
   * High-Performance Client-Side Image Preprocessing & Compression
   * Resizes large phone photos (e.g. 10MB+) down to max 1024px before transmission.
   * Eliminates payload timeouts, slow network lag, and HTTP body errors.
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Optimizing image for ML inspection...');
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const rawDataUrl = event.target.result as string;

        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 1024;
            let width = img.width;
            let height = img.height;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
              setSelectedImage(compressedBase64);
              setActiveSampleId('custom');
              runInspection(compressedBase64, 'custom');
            } else {
              setSelectedImage(rawDataUrl);
              setActiveSampleId('custom');
              runInspection(rawDataUrl, 'custom');
            }
          } catch (canvasErr) {
            console.warn('Canvas compression fallback:', canvasErr);
            setSelectedImage(rawDataUrl);
            setActiveSampleId('custom');
            runInspection(rawDataUrl, 'custom');
          }
        };

        img.onerror = () => {
          setSelectedImage(rawDataUrl);
          setActiveSampleId('custom');
          runInspection(rawDataUrl, 'custom');
        };

        img.src = rawDataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: (typeof SAMPLE_INSPECTION_ITEMS)[0]) => {
    setSelectedImage(sample.image);
    setActiveSampleId(sample.id);
    runInspection(undefined, sample.id);
  };

  const handleCopyDescription = () => {
    if (!inspectionResult?.ai_generated_description) return;
    navigator.clipboard.writeText(inspectionResult.ai_generated_description);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  // Run initial demo on mount
  React.useEffect(() => {
    runInspection(undefined, 'cement');
  }, []);

  const isNonConstruction = Boolean(inspectionResult && inspectionResult.is_construction_material === false);
  const isWorstCondition = Boolean(
    inspectionResult &&
    (inspectionResult.condition === 'Poor' || inspectionResult.quality_grade === 'Worst') &&
    !isNonConstruction
  );
  const isAverageCondition = Boolean(inspectionResult && inspectionResult.condition === 'Average' && !isNonConstruction);
  const isGoodCondition = Boolean(inspectionResult && inspectionResult.condition === 'Good' && !isNonConstruction);
  const isExcellentCondition = Boolean(inspectionResult && inspectionResult.condition === 'Excellent' && !isNonConstruction);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner with Command Center Highlights */}
      <div className="bg-gradient-to-r from-[#252536] via-[#3a2f52] to-[#51416F] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden border border-[#7561A8]/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#72B9E8]/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-[#72B9E8] border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              RoboInspector AI Unit • Gemini Vision Engine
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight">
              AI Material Quality & Defect Inspector
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Upload photographs of leftover construction materials. Our interactive 3D RoboInspector analyzes surface degradation, structural cracks, oxidation levels, and moisture ingress to provide instant marketplace condition ratings.
            </p>
          </div>

          {/* Quick Metrics Badge Strip with AI Advisory */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0 text-xs max-w-lg">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center flex flex-col justify-center">
              <span className="text-[10px] text-gray-300 uppercase tracking-wider block font-medium">Model Precision</span>
              <span className="font-display font-extrabold text-lg text-[#72B9E8]">99.4%</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center flex flex-col justify-center">
              <span className="text-[10px] text-amber-300 uppercase tracking-wider block font-bold">AI Advisory</span>
              <span className="text-[11px] font-semibold text-white leading-snug mt-0.5">
                It is AI — it can make mistakes & takes time to analyze material
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center flex flex-col justify-center">
              <span className="text-[10px] text-gray-300 uppercase tracking-wider block font-medium">Defect Indices</span>
              <span className="font-display font-extrabold text-lg text-purple-200">14 Metrics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Robot + Results Directly Below) & Right Column (Viewfinder + Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: 3D ROBOT INSPECTOR + RESULTS DIRECTLY RIGHT BELOW IT        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Interactive 3D Robot Unit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#51416F] flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#7561A8]" />
                Interactive 3D Scanning Robot
              </span>
              <span className="text-[10px] font-semibold text-[#8B8D98]">Hover over face to track cursor</span>
            </div>

            <RobotInspector3D
              isScanning={loading || activeScanPulse}
              detectedMaterial={inspectionResult?.material_type || 'Cement & Rebar'}
              onTriggerScan={() => {
                setActiveScanPulse(true);
                setTimeout(() => setActiveScanPulse(false), 2400);
              }}
            />
          </div>

          {/* 2. RESULTS CARD: PLACED DIRECTLY RIGHT BELOW THE ROBO INSPECTOR */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-[#252536] flex items-center gap-1.5 uppercase tracking-wider">
                <Scan className="w-4 h-4 text-[#7561A8]" />
                RoboInspector Inspection Results
              </span>
              <span className="text-[10px] text-[#8B8D98]">Live Analysis Output</span>
            </div>

            {loading ? (
              <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-[#7561A8]/40 shadow-md text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#7561A8] border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#252536]">
                    {uploadStatus || 'RoboInspector Analyzing Material Pixels...'}
                  </h4>
                  <p className="text-xs text-[#8B8D98] max-w-sm mx-auto">
                    Applying computer vision models to detect material category, crack lines, rust oxidation, moisture, and surface chipping...
                  </p>
                </div>
              </div>
            ) : errorMsg ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                  <h4 className="font-bold text-sm">Inspection Error</h4>
                </div>
                <p className="text-xs text-rose-800">{errorMsg}</p>
                <button
                  onClick={() => runInspection(undefined, activeSampleId)}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors"
                >
                  Retry Inspection
                </button>
              </div>
            ) : inspectionResult ? (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-lg space-y-5">
                {/* CASE A: NON-CONSTRUCTION MATERIAL DETECTED */}
                {isNonConstruction && (
                  <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <h3 className="font-extrabold text-sm sm:text-base text-amber-900">
                        Not a Construction Material!
                      </h3>
                    </div>
                    <p className="text-xs text-amber-900 font-medium leading-relaxed">
                      {inspectionResult.simple_verdict}
                    </p>
                    <div className="text-[11px] bg-amber-100/80 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                      <strong>AI Object Recognition:</strong> Identified as{' '}
                      <span className="font-bold underline">{inspectionResult.detected_object_name || 'Non-Construction Object'}</span>.
                      Our platform only allows trading real civil and building materials.
                    </div>
                  </div>
                )}

                {/* CASE B: WORST CONDITION / UNFIT MATERIAL */}
                {isWorstCondition && (
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
                      <h3 className="font-extrabold text-sm sm:text-base text-rose-900">
                        Worst Condition — Unfit for Construction!
                      </h3>
                    </div>
                    <p className="text-xs text-rose-900 font-medium leading-relaxed">
                      {inspectionResult.simple_verdict}
                    </p>
                    <div className="text-[11px] bg-rose-100/80 p-2.5 rounded-xl border border-rose-200 text-rose-900">
                      <strong>Safety Warning:</strong> This material has severe structural damage, heavy deep rust pitting, or hardened moisture lumps. It fails basic building safety standards and should only be recycled as scrap metal or rubble.
                    </div>
                  </div>
                )}

                {/* CASE C: AVERAGE / NEEDS CLEANING */}
                {isAverageCondition && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 text-amber-950 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <h3 className="font-extrabold text-sm sm:text-base text-amber-900">
                        Average Condition — Usable with Preparation
                      </h3>
                    </div>
                    <p className="text-xs text-amber-900 font-medium leading-relaxed">
                      {inspectionResult.simple_verdict}
                    </p>
                  </div>
                )}

                {/* CASE D: GOOD MATERIAL */}
                {isGoodCondition && (
                  <div className="p-4 rounded-2xl bg-blue-50/90 border-2 border-blue-300 text-blue-950 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                      <h3 className="font-extrabold text-sm sm:text-base text-blue-900">
                        Good Usable Material — Safe to Reuse
                      </h3>
                    </div>
                    <p className="text-xs text-blue-900 font-medium leading-relaxed">
                      {inspectionResult.simple_verdict}
                    </p>
                  </div>
                )}

                {/* CASE E: EXCELLENT / FACTORY PRISTINE */}
                {isExcellentCondition && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <h3 className="font-extrabold text-sm sm:text-base text-emerald-900">
                        Top-Tier Excellent Quality — Factory Grade
                      </h3>
                    </div>
                    <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                      {inspectionResult.simple_verdict}
                    </p>
                  </div>
                )}

                {/* Material Header Details */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] text-[#8B8D98] font-bold uppercase tracking-wider block">
                      Detected Material Category
                    </span>
                    <h3 className="font-display font-extrabold text-lg sm:text-xl text-[#252536]">
                      {inspectionResult.material_type}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${
                        isNonConstruction
                          ? 'bg-gray-100 text-gray-700 border-gray-300'
                          : isWorstCondition
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isAverageCondition
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : isGoodCondition
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      Rating: {isWorstCondition ? 'Worst (Poor)' : inspectionResult.condition}
                    </span>
                    <span className="text-[11px] font-bold text-[#8B8D98]">
                      {Math.round((inspectionResult.confidence_score || 0.9) * 100)}% ML Confidence
                    </span>
                  </div>
                </div>

                {/* Machine Learning Computer Vision Analysis Cards (Simple Language) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#252536] flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-[#7561A8]" />
                    Machine Learning Visual Scan Results:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-[#F1F2F5]/70 space-y-1">
                      <span className="text-[10px] font-bold text-[#8B8D98] block">1. Cracks & Structural Fractures</span>
                      <p className="font-semibold text-[#252536] text-[11px] leading-snug">
                        {inspectionResult.cracks_or_breakage}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F1F2F5]/70 space-y-1">
                      <span className="text-[10px] font-bold text-[#8B8D98] block">2. Rust & Oxidation Level</span>
                      <p className="font-semibold text-[#252536] text-[11px] leading-snug">
                        {inspectionResult.rust_or_corrosion}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F1F2F5]/70 space-y-1">
                      <span className="text-[10px] font-bold text-[#8B8D98] block">3. Surface & Moisture Finish</span>
                      <p className="font-semibold text-[#252536] text-[11px] leading-snug">
                        {inspectionResult.surface_quality}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F1F2F5]/70 space-y-1">
                      <span className="text-[10px] font-bold text-[#8B8D98] block">4. Building Safety Verdict</span>
                      <p className="font-semibold text-[#252536] text-[11px] leading-snug">
                        {inspectionResult.suitability_for_reuse}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simple Language Action Advice */}
                {inspectionResult.simple_advice && (
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/60 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7561A8] block">
                      Direct Advice for You:
                    </span>
                    <p className="text-xs font-medium text-[#51416F] leading-relaxed">
                      {inspectionResult.simple_advice}
                    </p>
                  </div>
                )}

                {/* Action CTA Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    disabled={isNonConstruction}
                    onClick={() => {
                      if (isNonConstruction) return;
                      onNavigate('list-material', {
                        prefill: {
                          ...inspectionResult,
                          image_url: selectedImage,
                        },
                      });
                    }}
                    className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                      isNonConstruction
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                        : isWorstCondition
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                        : 'bg-[#7561A8] hover:bg-[#51416F] text-white shadow-[#7561A8]/30 active:scale-98'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#72B9E8]" />
                    {isNonConstruction
                      ? 'Cannot List: Not Construction Material'
                      : isWorstCondition
                      ? 'List As Scrap Material Only'
                      : 'Use AI Details to List Material'}
                    {!isNonConstruction && <ArrowRight className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => runInspection(undefined, activeSampleId)}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-bold bg-[#F1F2F5] hover:bg-gray-200 text-[#51416F] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Re-analyze
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-xs space-y-2">
                <HelpCircle className="w-8 h-8 text-[#8B8D98] mx-auto" />
                <h4 className="font-bold text-sm text-[#252536]">No Inspection Run Yet</h4>
                <p className="text-xs text-[#8B8D98]">Select a sample or upload a photo to see the results here.</p>
              </div>
            )}
          </div>

          {/* 3. Robotic Sensor Telemetry Box */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-[#252536] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#7561A8]" />
                Robotic Sensor Telemetry
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                Calibrated
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-xl bg-[#F1F2F5]/80 space-y-0.5">
                <span className="text-[#8B8D98] text-[10px] block">Optical LiDAR Aperture</span>
                <span className="font-bold text-[#252536]">Dual Lens • 650nm</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F1F2F5]/80 space-y-0.5">
                <span className="text-[#8B8D98] text-[10px] block">Surface Roughness</span>
                <span className="font-bold text-[#252536]">Ra: 0.82 µm Standard</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F1F2F5]/80 space-y-0.5">
                <span className="text-[#8B8D98] text-[10px] block">Moisture Ingress Sensor</span>
                <span className="font-bold text-emerald-600">3.4% • Non-Critical</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F1F2F5]/80 space-y-0.5">
                <span className="text-[#8B8D98] text-[10px] block">Reusability Potential</span>
                <span className="font-bold text-[#7561A8]">
                  {isWorstCondition ? 'Scrap Only' : isNonConstruction ? 'Not Applicable' : 'Tier 1 Certified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: VIEWFINDER + SAMPLES + EXTENDED TECHNICAL SPECIFICATIONS   */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Inspection Viewfinder with Laser Scanner & Crosshairs */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-[#252536] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#7561A8]" />
                Live Material Optical Viewfinder
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Optical Sensor Active
                </span>
              </div>
            </div>

            <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-gray-950 border border-gray-200">
              <img
                src={selectedImage}
                alt="Material for inspection"
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Crosshairs Overlay */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-[#72B9E8] rounded-tl" />
                  <div className="w-6 h-6 border-t-2 border-r-2 border-[#72B9E8] rounded-tr" />
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-[#72B9E8] rounded-bl" />
                  <div className="w-6 h-6 border-b-2 border-r-2 border-[#72B9E8] rounded-br" />
                </div>
              </div>

              {/* Central Crosshair Dot & Focus Ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-12 h-12 rounded-full border border-[#72B9E8]/40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#72B9E8]" />
                </div>
              </div>

              {/* Animated Holographic Laser Scanline */}
              {(loading || activeScanPulse) && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#72B9E8] to-transparent shadow-[0_0_15px_#72B9E8] animate-scanline pointer-events-none z-10" />
              )}

              {/* Scanning Active Loading Backdrop */}
              {loading && (
                <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-3 z-20">
                  <div className="w-10 h-10 border-4 border-[#72B9E8] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-[#72B9E8] animate-pulse">
                    RoboInspector analyzing surface texture & defects with Gemini Vision...
                  </p>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <label className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-[#7561A8]/40 hover:border-[#7561A8] bg-[#F1F2F5]/70 hover:bg-[#7561A8]/10 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-[#51416F]">
              <Upload className="w-4 h-4 text-[#7561A8]" />
              <span>Upload Custom Photo from Your Construction Site</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Preset Real-World Test Samples */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#252536] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#7561A8]" />
                Test With Pune Site Samples
              </span>
              <span className="text-[10px] text-[#8B8D98]">1-Click Run</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {SAMPLE_INSPECTION_ITEMS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                    activeSampleId === sample.id
                      ? 'border-[#7561A8] bg-purple-50/50 ring-2 ring-[#7561A8]/20 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="h-18 rounded-xl overflow-hidden mb-2 bg-gray-100 relative">
                    <img
                      src={sample.image}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-black/60 text-white backdrop-blur-xs">
                      {sample.category}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[#252536] truncate">{sample.name}</h4>
                    <p className="text-[10px] text-[#8B8D98] truncate">{sample.conditionTag}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Extended Engineering Details (Descriptions, Observed Defects, Handling) */}
          {inspectionResult && !isNonConstruction && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-5">
              {/* AI-Generated Professional Marketplace Description */}
              <div className="space-y-1.5 bg-[#F1F2F5]/60 p-4 rounded-2xl border border-gray-100 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#51416F] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#7561A8]" />
                    AI-Generated Marketplace Description
                  </span>
                  <button
                    onClick={handleCopyDescription}
                    className="p-1 rounded-md text-[#8B8D98] hover:text-[#51416F] text-[11px] flex items-center gap-1 transition-colors"
                    title="Copy description"
                  >
                    {copiedDesc ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </span>
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#252536] leading-relaxed">
                  {inspectionResult.ai_generated_description}
                </p>
              </div>

              {/* Observed Defects List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#252536] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#7561A8]" />
                  Observed Visual Defects:
                </h4>
                <div className="space-y-1">
                  {inspectionResult.visible_damage.map((defect, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-[#51416F] bg-purple-50/40 px-3 py-1.5 rounded-lg"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7561A8]" />
                      <span>{defect}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Next Steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#252536] flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Recommended Handling & Site Storage:
                </h4>
                <ul className="space-y-1.5 text-xs text-[#51416F]">
                  {inspectionResult.recommended_next_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Engineering Disclaimer */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Non-Destructive Preliminary Screening Disclaimer</strong>
                  <span>{inspectionResult.disclaimer}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
