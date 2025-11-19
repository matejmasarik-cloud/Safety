import React, { useState, useRef } from 'react';
import { MATRIX_CONFIG, Finding } from '../types';
import { X, Camera, Sparkles, Trash2, Upload } from 'lucide-react';
import { enhanceDescription } from '../services/geminiService';

interface InspectionModalProps {
  cellId: string | null;
  onClose: () => void;
  onSave: (finding: Omit<Finding, 'id' | 'timestamp'>) => void;
}

const InspectionModal: React.FC<InspectionModalProps> = ({ cellId, onClose, onSave }) => {
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!cellId) return null;

  const [rowStr, colStr] = cellId.split('-');
  const rowId = parseInt(rowStr);
  const rowLabel = MATRIX_CONFIG.rows.find(r => r.id === rowId)?.label || '';
  const colLabel = MATRIX_CONFIG.columns.find(c => c.id === colStr)?.label || '';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const remainingSlots = 3 - images.length;
      const filesToProcess = files.slice(0, remainingSlots);

      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleEnhanceText = async () => {
    if (!comment.trim()) return;
    setIsEnhancing(true);
    const enhanced = await enhanceDescription(comment);
    setComment(enhanced);
    setIsEnhancing(false);
  };

  const handleSave = () => {
    onSave({
      columnId: colStr,
      columnName: colLabel,
      rowId: rowId,
      rowName: rowLabel,
      comment,
      images
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-yellow-400 px-6 py-4 flex justify-between items-center border-b border-yellow-500">
          <h2 className="text-lg font-bold text-black">
             Nová inšpekcia: {colLabel}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-yellow-500 rounded-full transition">
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Typ zlyhania (Riadok)</label>
            <div className="text-xl font-semibold text-gray-800 flex items-center gap-2">
               <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-sm">{rowId}</span>
               {rowLabel}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Popis zlyhania
            </label>
            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Detailne popíšte nájdený problém..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 focus:border-transparent h-32 resize-none"
              />
              <button 
                onClick={handleEnhanceText}
                disabled={isEnhancing || !comment}
                className={`absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isEnhancing || !comment 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                {isEnhancing ? 'AI upravuje...' : 'AI Vylepšiť'}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
              <span>Fotodokumentácia (Max 3)</span>
              <span className="text-gray-400 text-xs">{images.length}/3</span>
            </label>
            
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-24 h-24 border rounded-lg overflow-hidden group">
                  <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {images.length < 3 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition"
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs">Pridať</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload} 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
          >
            Zrušiť
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-black text-yellow-400 font-bold rounded-lg shadow hover:bg-gray-800 transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Uložiť záznam
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectionModal;