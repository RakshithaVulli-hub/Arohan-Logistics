import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Calendar, 
  MapPin, 
  Clock, 
  Thermometer, 
  Droplets, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';
import { CROP_PROFILES } from '../../data/mockData';
import { FarmerWorkflowStepper } from './FarmerWorkflowStepper';

export const RegisterProduce: React.FC = () => {
  const { registerNewProduce, setCurrentView, activeUser, setTargetProduceId } = useColdChain();

  const [cropType, setCropType] = useState('Tomato');
  const [quantity, setQuantity] = useState(500);
  const [unit, setUnit] = useState<'kg' | 'quintals'>('kg');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [sourceLocation, setSourceLocation] = useState(activeUser.location || 'Guntur Rural (Plot 12)');
  const [expectedDuration, setExpectedDuration] = useState(14);
  const [hasImage, setHasImage] = useState(false);
  
  // Grading State
  const [gradingStep, setGradingStep] = useState<'form' | 'scanning' | 'result'>('form');

  // Suggested profile defaults
  const currentProfile = CROP_PROFILES[cropType] || CROP_PROFILES['Tomato'];
  const [preferredTempMin, setPreferredTempMin] = useState(currentProfile.optimalTempMin);
  const [preferredTempMax, setPreferredTempMax] = useState(currentProfile.optimalTempMax);
  const [preferredHumidityMin, setPreferredHumidityMin] = useState(currentProfile.optimalHumidityMin);
  const [preferredHumidityMax, setPreferredHumidityMax] = useState(currentProfile.optimalHumidityMax);

  const [registeredId, setRegisteredId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCropChange = (selectedCrop: string) => {
    setCropType(selectedCrop);
    const prof = CROP_PROFILES[selectedCrop] || CROP_PROFILES['Tomato'];
    setPreferredTempMin(prof.optimalTempMin);
    setPreferredTempMax(prof.optimalTempMax);
    setPreferredHumidityMin(prof.optimalHumidityMin);
    setPreferredHumidityMax(prof.optimalHumidityMax);
    setExpectedDuration(prof.typicalShelfLifeDays);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!cropType || cropType.trim() === '') {
      setErrorMessage('Please select a valid crop type.');
      return;
    }

    const normalizedQty = unit === 'quintals' ? quantity * 100 : quantity;
    if (isNaN(normalizedQty) || normalizedQty <= 0) {
      setErrorMessage('Please enter a valid positive produce quantity.');
      return;
    }

    if (!harvestDate || harvestDate.trim() === '') {
      setErrorMessage('Please specify a valid harvest date.');
      return;
    }

    if (!sourceLocation || sourceLocation.trim() === '') {
      setErrorMessage('Please enter the farm source location.');
      return;
    }

    setIsSubmitting(true);
    setGradingStep('scanning');
    
    try {
      // Brief visual delay for scanning animation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newProd = await registerNewProduce({
        cropType,
        quantity: normalizedQty,
        harvestDate,
        sourceLocation: sourceLocation.trim(),
        expectedDuration,
        preferredTempMin,
        preferredTempMax,
        preferredHumidityMin,
        preferredHumidityMax
      });

      setRegisteredId(newProd.produceId);
      setTargetProduceId(newProd.produceId);
      setGradingStep('result');
    } catch (err: any) {
      // Return to form, keep user inputs intact, and display error message
      setGradingStep('form');
      setErrorMessage(
        err.message || 'Failed to save produce. Please ensure the system connection is active and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (gradingStep === 'scanning') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6 animate-in fade-in">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-full h-full bg-emerald-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mt-4">Checking Produce Details & Saving...</h2>
          <p className="text-sm text-slate-500 mt-2">Evaluating produce quality and saving your harvest details.</p>
        </div>
      </div>
    );
  }

  if (gradingStep === 'result') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <FarmerWorkflowStepper compact />

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Registered Batch Reference: {registeredId}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">
              Produce Successfully Registered!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
              {quantity} {unit} of {cropType} has been successfully recorded into the system.
            </p>
          </div>

          {/* Quality Certificate Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-left space-y-4 max-w-md mx-auto shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 relative z-10">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-base font-display">Produce Quality Summary (Demonstration Estimate)</span>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full uppercase">Recorded</span>
            </div>

            <div className="space-y-3 relative z-10 text-slate-300 text-xs">
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Crop Type:</span>
                <span className="font-bold text-white">{cropType}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Quality Grade:</span>
                <span className="font-bold text-emerald-400">Grade A (Optimal)</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Estimated Freshness:</span>
                <span className="font-bold text-white">94%</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Estimated Spoilage Risk:</span>
                <span className="font-bold text-emerald-400">6% (Low Risk)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Recommended Storage Conditions:</span>
                <span className="font-bold text-indigo-300">
                  {preferredTempMin}°C - {preferredTempMax}°C (RH: {preferredHumidityMin}%-{preferredHumidityMax}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="proceed-to-ai-recommendation-btn"
              onClick={() => {
                setTargetProduceId(registeredId);
                setCurrentView('recommendation');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Find Cold Storage for This Batch ({registeredId})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setGradingStep('form');
                setQuantity(500);
                setUnit('kg');
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition cursor-pointer"
            >
              + Register Another Batch
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('farmer_dashboard')}
              className="w-full sm:w-auto px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition cursor-pointer"
            >
              Back to Farmer Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => setCurrentView('farmer_dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 mb-1 transition-colors"
        >
          ← Back to Farmer Portal
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
          Register Produce
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Record your harvested crop details to discover suitable cold-storage facilities and coordinate transport.
        </p>
      </div>

      {/* Farmer Workflow Stepper */}
      <FarmerWorkflowStepper compact />

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-red-900">Registration Failed</span>
              <span className="mt-0.5 block">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-700 font-bold p-1 cursor-pointer"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Crop Type & Quantity Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="sm:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Crop Type *
            </label>
            <select
              id="crop-type-select"
              value={cropType}
              onChange={(e) => handleCropChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs font-medium focus:outline-emerald-600 focus:bg-white transition"
              required
            >
              {Object.keys(CROP_PROFILES).map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Quantity *
            </label>
            <input
              id="crop-quantity-input"
              type="number"
              min="10"
              max="50000"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs font-medium focus:outline-emerald-600 focus:bg-white transition"
              required
            />
          </div>

          <div className="sm:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs font-medium focus:outline-emerald-600 focus:bg-white transition"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="quintals">Quintals (qtl)</option>
            </select>
          </div>

        </div>

        {/* Quantity Preset Chips */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-600 block">
            Quick Quantity Presets (kg):
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[500, 1000, 2500, 5000, 10000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setQuantity(val);
                  setUnit('kg');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                  quantity === val && unit === 'kg'
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {val.toLocaleString()} kg
              </button>
            ))}
            <span className="text-[10px] text-slate-400 italic ml-1">
              (Limits: 10 kg – 50,000 kg)
            </span>
          </div>
        </div>

        {/* Location & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Harvest Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs font-medium focus:outline-emerald-600 focus:bg-white transition"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Farm Source Location *
            </label>
            <input
              type="text"
              value={sourceLocation}
              onChange={(e) => setSourceLocation(e.target.value)}
              placeholder="e.g. Guntur Rural / Tenali Road"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs font-medium focus:outline-emerald-600 focus:bg-white transition"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Expected Storage (Days)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={expectedDuration}
              onChange={(e) => setExpectedDuration(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs font-medium focus:outline-emerald-600 focus:bg-white transition"
              required
            />
          </div>

        </div>

        {/* Recommended Storage Parameters */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 
              Recommended Storage Conditions for {cropType}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Recommended Profile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            
            {/* Temperature Range */}
            <div>
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-red-500" /> Optimal Temperature (°C)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={preferredTempMin}
                  onChange={(e) => setPreferredTempMin(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                  placeholder="Min °C"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="number"
                  step="0.5"
                  value={preferredTempMax}
                  onChange={(e) => setPreferredTempMax(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                  placeholder="Max °C"
                />
              </div>
            </div>

            {/* Humidity Range */}
            <div>
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1 mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" /> Optimal Relative Humidity (% RH)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={preferredHumidityMin}
                  onChange={(e) => setPreferredHumidityMin(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                  placeholder="Min %"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={preferredHumidityMax}
                  onChange={(e) => setPreferredHumidityMax(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                  placeholder="Max %"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Quality Image Upload */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            Upload Produce Sample Image
          </label>
          <div 
            onClick={() => setHasImage(true)}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition ${
              hasImage ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-emerald-300'
            }`}
          >
            {hasImage ? (
              <div className="flex flex-col items-center text-emerald-700">
                <CheckCircle2 className="w-8 h-8 mb-2" />
                <span className="text-sm font-semibold">Sample Image Uploaded</span>
                <span className="text-[10px] opacity-80 mt-1">Ready to process</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500">
                <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                <span className="text-sm font-semibold">Click to upload crop sample</span>
                <span className="text-[10px] mt-1">JPEG, PNG (Max 5MB)</span>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setCurrentView('farmer_dashboard')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>

          <button
            id="register-produce-submit-btn"
            type="submit"
            disabled={!hasImage || isSubmitting}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 ${
              hasImage && !isSubmitting
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-800" />
                <span>Saving produce...</span>
              </>
            ) : hasImage ? (
              <>
                <span>Check Quality & Register Produce</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              'Upload Image to Continue'
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
