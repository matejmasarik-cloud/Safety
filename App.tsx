import React, { useState } from 'react';
import { MATRIX_CONFIG, Finding, INSPECTOR_NAME, LOCATION_NAME } from './types';
import InspectionModal from './components/InspectionModal';
import { generatePDF } from './utils/pdfGenerator';
import { PlusCircle, FileDown, Trash2, ClipboardCheck, Image as ImageIcon } from 'lucide-react';

const App: React.FC = () => {
  const [activeModalCell, setActiveModalCell] = useState<string | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);

  // --- Matrix Helper ---
  const isCellActive = (rowId: number, colId: string) => {
    return MATRIX_CONFIG.activeCells.includes(`${rowId}-${colId}`);
  };

  // --- Handlers ---
  const handleCellClick = (rowId: number, colId: string) => {
    if (isCellActive(rowId, colId)) {
      setActiveModalCell(`${rowId}-${colId}`);
    }
  };

  const handleSaveFinding = (data: Omit<Finding, 'id' | 'timestamp'>) => {
    const newFinding: Finding = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setFindings(prev => [...prev, newFinding]);
  };

  const handleDeleteFinding = (id: string) => {
    setFindings(prev => prev.filter(f => f.id !== id));
  };

  const handleExportPDF = () => {
    if (findings.length === 0) {
      alert('Najskôr pridajte aspoň jeden záznam.');
      return;
    }
    generatePDF(findings);
  };

  const today = new Date().toLocaleDateString('sk-SK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-md">
              <ClipboardCheck className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">AUO 5S Inšpekcia</h1>
              <p className="text-xs text-gray-500">{LOCATION_NAME} | {INSPECTOR_NAME}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right text-sm text-gray-600">
                <p className="font-medium capitalize">{today}</p>
                <p className="text-xs text-gray-400">{findings.length} záznamov</p>
             </div>
             <button 
              onClick={handleExportPDF}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold shadow-sm transition-all ${
                findings.length > 0 
                ? 'bg-black text-white hover:bg-gray-800' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              disabled={findings.length === 0}
             >
               <FileDown className="w-4 h-4" />
               Export PDF
             </button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 max-w-[1600px] mx-auto w-full flex flex-col xl:flex-row gap-6">
        
        {/* LEFT: The Matrix Grid */}
        <section className="flex-grow xl:w-3/4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-yellow-500" />
              Vyberte miesto zlyhania
            </h2>
            <p className="text-xs text-gray-500 mt-1">Kliknite na žlté políčko pre pridanie záznamu.</p>
          </div>
          
          <div className="overflow-auto p-2">
             {/* Grid Container */}
             <div className="inline-block min-w-full">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="p-2 border border-gray-200 bg-gray-100 text-left text-xs font-bold text-gray-600 sticky left-0 z-10 w-40">
                        Kategória
                      </th>
                      {MATRIX_CONFIG.columns.map(col => (
                        <th key={col.id} className="p-2 border border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-600 min-w-[100px]">
                           <span className="block font-bold text-gray-800 mb-1">{col.id}</span>
                           <span className="leading-tight text-[10px]">{col.label}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MATRIX_CONFIG.rows.map(row => (
                      <tr key={row.id}>
                        <td className="p-3 border border-gray-200 bg-gray-50 font-bold text-xs text-gray-700 sticky left-0 z-10 border-r-2 border-r-gray-300">
                           {row.id}. {row.label}
                        </td>
                        {MATRIX_CONFIG.columns.map(col => {
                          const isActive = isCellActive(row.id, col.id);
                          const hasFinding = findings.some(f => f.columnId === col.id && f.rowId === row.id);
                          
                          return (
                            <td 
                              key={`${row.id}-${col.id}`}
                              onClick={() => handleCellClick(row.id, col.id)}
                              className={`
                                border border-gray-200 relative transition-all duration-200
                                ${isActive 
                                  ? 'bg-yellow-300 hover:bg-yellow-400 cursor-pointer hover:shadow-inner' 
                                  : 'bg-white opacity-40 cursor-default'
                                }
                              `}
                              style={{ height: '60px' }}
                            >
                              {isActive && (
                                <div className="w-full h-full flex items-center justify-center">
                                   {hasFinding && (
                                     <div className="w-6 h-6 bg-red-600 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-md animate-pulse">
                                       !
                                     </div>
                                   )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </section>

        {/* RIGHT: Findings List */}
        <section className="xl:w-1/4 w-full flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-grow flex flex-col h-[600px] xl:h-auto xl:sticky xl:top-24">
             <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
               <h3 className="font-bold text-gray-800">Zoznam zistení</h3>
               <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">{findings.length}</span>
             </div>
             
             <div className="flex-grow overflow-y-auto p-4 space-y-3">
               {findings.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-6">
                    <ClipboardCheck className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm">Žiadne záznamy.<br/>Kliknite na žlté políčko v matici.</p>
                 </div>
               ) : (
                 findings.map(finding => (
                   <div key={finding.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition group relative">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="inline-block bg-black text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded mr-2">
                            {finding.columnId}-{finding.rowId}
                          </span>
                          <h4 className="text-sm font-bold text-gray-800 inline">{finding.columnName}</h4>
                        </div>
                        <button 
                          onClick={() => handleDeleteFinding(finding.id)}
                          className="text-gray-300 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-xs font-medium text-gray-500 mb-1">{finding.rowName}</p>
                      <p className="text-xs text-gray-700 line-clamp-3 mb-2 bg-gray-50 p-2 rounded border border-gray-100 italic">
                        "{finding.comment || 'Bez popisu'}"
                      </p>
                      
                      {finding.images.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-blue-600 font-medium bg-blue-50 inline-flex px-2 py-1 rounded">
                          <ImageIcon className="w-3 h-3" />
                          {finding.images.length} fotky
                        </div>
                      )}
                   </div>
                 ))
               )}
             </div>
          </div>
        </section>
      </main>

      <InspectionModal 
        cellId={activeModalCell}
        onClose={() => setActiveModalCell(null)}
        onSave={handleSaveFinding}
      />
    </div>
  );
};

export default App;