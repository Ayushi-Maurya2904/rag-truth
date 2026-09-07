import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Sparkles, 
  RotateCcw,
  Search,
  FileText,
  Bot
} from 'lucide-react';

const DEMO_SOURCE = `Students must maintain at least 75% attendance to be eligible for the semester examinations and university scholarships. Exceptional medical leave up to 10% can be granted by the Department Head upon submitting valid hospital documentation. Absence without prior notice exceeding 14 consecutive days will result in automatic deregulation from the degree program.`;

const DEMO_ANSWER = `Students need at least 75% attendance to qualify for exams and scholarships. Medical leave up to 10% can be approved by the Department Head. Eligible students also receive a ₹2,000 monthly stipend.`;

const DEMO_QUERY = "What are the rules regarding student attendance and leave?";

export default function App() {
  const [sourceDoc, setSourceDoc] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const handleLoadDemo = () => {
    setSourceDoc(DEMO_SOURCE);
    setAiAnswer(DEMO_ANSWER);
    setQuery(DEMO_QUERY);
  };

  const handleReset = () => {
    setSourceDoc('');
    setAiAnswer('');
    setQuery('');
    setResult(null);
    setSelectedClaim(null);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceDoc, aiAnswer, query })
      });

      if (!response.ok) throw new Error("Failed to reach audit server");

      const data = await response.json();
      setResult(data);
      if (data.claims && data.claims.length > 0) {
        setSelectedClaim(data.claims[0]);
      }
    } catch (err) {
      console.error(err);
      alert("Error processing verification. Ensure Express backend is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'supported':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Supported
          </span>
        );
      case 'partially_supported':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Partially Supported
          </span>
        );
      case 'unsupported':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Unsupported
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-emerald-500 selection:text-neutral-950">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg tracking-tight">RAG-Truth</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-mono">Grounding Auditor</span>
          </div>

          <div className="text-xs text-neutral-500 font-mono">
            Hackathon Build v0.3
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!result ? (
          /* Input Form View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Verify AI Answer Grounding</h1>
                <p className="text-sm text-neutral-400 mt-1">Extract claims, cross-verify against source documents, and audit hallucinations at the claim level.</p>
              </div>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="inline-flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-300 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Load Demo Data
              </button>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Source Document Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" /> Source Document (Ground Truth)
                    </span>
                    <span className="text-neutral-500">{sourceDoc.length} chars</span>
                  </div>
                  <textarea
                    rows={8}
                    required
                    value={sourceDoc}
                    onChange={(e) => setSourceDoc(e.target.value)}
                    placeholder="Paste your source document or ground truth context here..."
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 p-4 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none font-mono text-neutral-200 placeholder:text-neutral-600"
                  />
                </div>

                {/* AI Answer Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    <span className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-emerald-400" /> AI Generated Answer
                    </span>
                    <span className="text-neutral-500">{aiAnswer.length} chars</span>
                  </div>
                  <textarea
                    rows={8}
                    required
                    value={aiAnswer}
                    onChange={(e) => setAiAnswer(e.target.value)}
                    placeholder="Paste the generated response to verify..."
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 p-4 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none font-mono text-neutral-200 placeholder:text-neutral-600"
                  />
                </div>
              </div>

              {/* Optional User Query Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-neutral-500" /> User Query <span className="text-neutral-600 lowercase">(optional)</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. What are the attendance rules?"
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-neutral-200 placeholder:text-neutral-600"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-sm font-medium transition-colors"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      Auditing Grounding...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Verify Answer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Results Dashboard View */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                ← Verify Another Answer
              </button>
              <span className="text-xs font-mono text-neutral-500">
                Audited {result.totalClaims} claims
              </span>
            </div>

            {/* Scorecard Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Faithfulness Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-amber-400">{result.score}%</span>
                  <span className="text-xs text-neutral-500">grounded</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Supported
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{result.supportedCount}</span>
                  <span className="text-xs text-neutral-500">/ {result.totalClaims} claims</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Partially Supported
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{result.partiallySupportedCount}</span>
                  <span className="text-xs text-neutral-500">/ {result.totalClaims} claims</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Unsupported
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{result.unsupportedCount}</span>
                  <span className="text-xs text-neutral-500">/ {result.totalClaims} claims</span>
                </div>
              </div>
            </div>

            {/* Split Screen: Claims Breakdown vs Evidence Lens */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Claims List */}
              <div className="lg:col-span-7 space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                  Claim-by-Claim Analysis
                </h2>

                {result.claims.map((claimItem) => {
                  const isSelected = selectedClaim?.id === claimItem.id;
                  return (
                    <div
                      key={claimItem.id}
                      onClick={() => setSelectedClaim(claimItem)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-neutral-900 border-emerald-500/50 shadow-lg shadow-emerald-500/5' 
                          : 'bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm font-medium text-neutral-200">
                          "{claimItem.claim}"
                        </p>
                        {getStatusBadge(claimItem.status)}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                        <span>Confidence: {claimItem.confidence}%</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <Eye className="w-3.5 h-3.5" /> View Evidence Lens
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Evidence Lens Inspector */}
              <div className="lg:col-span-5">
                <div className="sticky top-24 p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> Evidence Lens
                    </span>
                    {selectedClaim && getStatusBadge(selectedClaim.status)}
                  </div>

                  {selectedClaim ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Extracted Claim</p>
                        <p className="text-sm font-medium bg-neutral-950 p-3 rounded-lg border border-neutral-800/80 text-neutral-200">
                          "{selectedClaim.claim}"
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Supporting Source Evidence</p>
                        {selectedClaim.sourceSentence ? (
                          <p className="text-sm bg-emerald-950/20 text-emerald-300 p-3 rounded-lg border border-emerald-500/20 font-mono">
                            "{selectedClaim.sourceSentence}"
                          </p>
                        ) : (
                          <p className="text-sm bg-rose-950/20 text-rose-300 p-3 rounded-lg border border-rose-500/20">
                            No matching evidence found in source document.
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Reasoning & Explanation</p>
                        <p className="text-xs text-neutral-400 bg-neutral-950 p-3 rounded-lg border border-neutral-800/80 leading-relaxed">
                          {selectedClaim.explanation}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 italic py-8 text-center">
                      Select a claim on the left to inspect ground truth evidence.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}