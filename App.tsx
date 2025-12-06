import React, { useState, useEffect } from 'react';
import { AnalysisState } from './types';
import { analyzeImageWithGemini } from './services/geminiService';
import { generateMarketingCopy } from './services/kolosalService';
import { StepIndicator } from './components/StepIndicator';
import { ImageUploader } from './components/ImageUploader';

const App: React.FC = () => {
  const [kolosalKey, setKolosalKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState<boolean>(false);
  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    imageSrc: null,
    imageDescription: null,
    finalCopy: null,
    error: null,
  });

  // Load Kolosal key from storage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('KOLOSAL_API_KEY');
    if (savedKey) setKolosalKey(savedKey);
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('KOLOSAL_API_KEY', kolosalKey);
    setShowSaveConfirmation(true);
    setTimeout(() => {
      setShowSaveConfirmation(false);
    }, 3000);
  };

  const handleImageSelect = async (file: File) => {
    if (!kolosalKey) {
      alert("Mohon masukkan API Key Kolosal Anda terlebih dahulu di menu pengaturan.");
      setShowKeyInput(true);
      return;
    }

    // Reset state for new process
    setState(prev => ({ 
      ...prev, 
      status: 'analyzing_image', 
      error: null, 
      finalCopy: null,
      imageDescription: null 
    }));

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      setState(prev => ({ ...prev, imageSrc: base64String }));

      try {
        // Step 1: Gemini Vision Analysis
        const description = await analyzeImageWithGemini(base64String, file.type);
        
        setState(prev => ({ 
          ...prev, 
          imageDescription: description,
          status: 'generating_copy' 
        }));

        // Step 2: Kolosal AI Copywriting
        const copy = await generateMarketingCopy(description, kolosalKey);

        setState(prev => ({ 
          ...prev, 
          finalCopy: copy,
          status: 'complete' 
        }));

      } catch (err: any) {
        setState(prev => ({ 
          ...prev, 
          status: 'error', 
          error: err.message || "Terjadi kesalahan tidak terduga."
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const prepareContentForShare = (rawText: string) => {
    const appPromo = "\n\n✨ Dibuat dengan Konten Kilat AI - Coba sekarang!";
    return rawText.trim() + appPromo;
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'tiktok' | 'instagram', content: string) => {
    const finalContent = prepareContentForShare(content);
    const textEncoded = encodeURIComponent(finalContent);
    const urlEncoded = encodeURIComponent(window.location.href);
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${textEncoded}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${urlEncoded}&quote=${textEncoded}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${textEncoded}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        break;
      case 'instagram':
        navigator.clipboard.writeText(finalContent);
        alert("Teks telah disalin! Mengarahkan ke Instagram...");
        window.open('https://www.instagram.com/', '_blank');
        break;
      case 'tiktok':
        navigator.clipboard.writeText(finalContent);
        alert("Teks telah disalin! Mengarahkan ke TikTok...");
        window.open('https://www.tiktok.com/', '_blank');
        break;
    }
  };

  const handleCopy = (content: string) => {
    const finalContent = prepareContentForShare(content);
    navigator.clipboard.writeText(finalContent);
    alert("Teks berhasil disalin ke clipboard!");
  };

  const renderMarkdown = (text: string) => {
    if (!text || !window.marked) return { __html: text || '' };
    return { __html: window.marked.parse(text) };
  };

  // Split content based on the delimiter set in the prompt
  const getVariations = (fullText: string | null) => {
    if (!fullText) return [];
    const delimiter = '---BATAS_VARIASI---';
    if (fullText.includes(delimiter)) {
      return fullText.split(delimiter).map(v => v.trim()).filter(v => v.length > 0);
    }
    return [fullText]; // Fallback if AI didn't use delimiter
  };

  const variations = getVariations(state.finalCopy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10 relative">
          <button 
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors"
            title="Pengaturan API Key"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>

          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            Konten Kilat <span className="text-blue-600">AI</span>
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Ubah foto produk menjadi materi pemasaran viral dalam hitungan detik.
          </p>
        </div>

        {/* API Key Input Panel */}
        {showKeyInput && (
          <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border border-orange-200 max-w-2xl mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">Kolosal AI API Key</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                value={kolosalKey}
                onChange={(e) => setKolosalKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button 
                onClick={handleSaveKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
            {showSaveConfirmation && (
              <div className="mt-2 text-sm text-green-600 font-medium animate-pulse">
                API Key Kolosal berhasil disimpan
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Key ini disimpan secara lokal di browser Anda.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload & Preview (4 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Upload Produk
              </h2>
              
              <ImageUploader 
                imageSrc={state.imageSrc} 
                onImageSelected={handleImageSelect}
                isLoading={state.status !== 'idle' && state.status !== 'complete' && state.status !== 'error'}
              />

              {/* Progress Indicator */}
              {(state.status === 'analyzing_image' || state.status === 'generating_copy') && (
                <div className="mt-6">
                  <StepIndicator currentStep={state.status} />
                </div>
              )}

              {/* Step 1 Result: Description (Optional/Debug) */}
              {state.imageDescription && (
                <div className="mt-6 bg-white/80 rounded-xl shadow-sm p-4 border border-blue-100">
                  <details className="text-sm text-gray-600">
                    <summary className="font-medium cursor-pointer text-blue-600 hover:text-blue-700">Lihat Analisis Visual Gemini</summary>
                    <p className="mt-2 p-2 bg-slate-50 rounded border border-slate-100 text-xs leading-relaxed max-h-40 overflow-y-auto">
                      {state.imageDescription}
                    </p>
                  </details>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Result (8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {state.error ? (
               <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-red-500 bg-red-50 border border-red-100 min-h-[400px]">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                 <p className="text-center font-medium text-lg">{state.error}</p>
               </div>
            ) : variations.length > 0 && state.finalCopy ? (
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Pilihan Konten
                    </h2>
                    <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {variations.length} Variasi Tersedia
                    </span>
                 </div>

                 {variations.map((variantText, idx) => (
                   <div key={idx} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Opsi #{idx + 1}</span>
                      </div>
                      <div className="p-6">
                        <div 
                          className="prose prose-sm prose-slate max-w-none prose-headings:text-blue-800 prose-a:text-blue-600 mb-6"
                          dangerouslySetInnerHTML={renderMarkdown(variantText)}
                        />
                        
                        {/* Action Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
                          <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
                             {/* Twitter */}
                            <button onClick={() => handleShare('twitter', variantText)} className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-all" title="Share ke Twitter">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                            </button>
                             {/* Facebook */}
                            <button onClick={() => handleShare('facebook', variantText)} className="p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all" title="Share ke Facebook">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                            </button>
                             {/* LinkedIn */}
                            <button onClick={() => handleShare('linkedin', variantText)} className="p-2 text-slate-400 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all" title="Share ke LinkedIn">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                            </button>
                            <div className="w-px h-6 bg-slate-200 mx-1"></div>
                            {/* Instagram */}
                             <button onClick={() => handleShare('instagram', variantText)} className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all" title="Salin & Buka Instagram">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                            </button>
                            {/* TikTok */}
                             <button onClick={() => handleShare('tiktok', variantText)} className="p-2 text-slate-400 hover:text-black hover:bg-slate-200 rounded-lg transition-all" title="Salin & Buka TikTok">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => handleCopy(variantText)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg transform active:scale-95 duration-150"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            Salin Teks
                          </button>
                        </div>
                      </div>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[400px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 bg-gray-50/50">
                {state.status === 'idle' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-30"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 13v6"/><path d="M9 16l3-3 3 3"/></svg>
                    <p className="text-lg">Unggah gambar untuk memulai</p>
                    <p className="text-sm mt-2 opacity-60">Hasil akan muncul di sini</p>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-medium text-gray-500 animate-pulse">
                      {state.status === 'analyzing_image' && 'Sedang menganalisis detail visual...'}
                      {state.status === 'generating_copy' && 'Sedang menulis berbagai variasi konten...'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Info & Credits Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Tentang Konten Kilat AI</h3>
          <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-600">
            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Kegunaan Aplikasi</h4>
              <p className="leading-relaxed mb-4">
                Aplikasi ini membantu Anda membuat caption pemasaran instan yang menarik untuk sosial media. 
                Dengan menggabungkan kecerdasan visual (Gemini) dan kemampuan menulis kreatif (Kolosal AI), 
                Anda tidak perlu lagi pusing memikirkan kata-kata promosi.
              </p>
            </div>
            <div>
               <h4 className="font-semibold text-slate-700 mb-2">Cara Menggunakan</h4>
               <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                 <li>Klik ikon pengaturan (pojok kanan atas) dan masukkan API Key Kolosal AI.</li>
                 <li>Unggah foto produk yang ingin dipasarkan.</li>
                 <li>Tunggu proses analisis visual dan penulisan naskah selesai.</li>
                 <li>Pilih variasi terbaik, lalu salin atau bagikan ke media sosial favorit Anda!</li>
               </ol>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center space-y-2 pb-8">
          <p className="text-sm text-gray-400">Powered by Google Gemini 2.5 Flash & Kolosal AI GLM 4.6</p>
          <p className="text-sm font-medium text-slate-500">
            Credits: Azar & Aunu (NCHMPK)
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;