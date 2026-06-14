import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getResumeAnalysis } from '../features/resume/resumeSlice';
import LoadingSpinner from './LoadingSpinner';
import { motion, useMotionValue } from 'framer-motion';
import {
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Github,
  Linkedin,
  Globe,
  Trophy,
} from 'lucide-react';

const ScoreHero = ({ score = 0, grade = 'N/A', status = '—' }) => {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    motionVal.set(0);
    motionVal.animate?.(score, { duration: 1.2 });
    const unsub = motionVal.on('change', (v) => setDisplay(Math.round(v)));
    motionVal.set(score);
    return () => unsub && unsub();
  }, [score, motionVal]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] p-6 rounded-2xl text-white flex items-center gap-6 shadow-lg"
    >
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="52" stroke="#0b1220" strokeWidth="8" fill="#060618" />
          <circle
            cx="60"
            cy="60"
            r="52"
            stroke="url(#g1)"
            strokeWidth="8"
            strokeDasharray={`${Math.round((score / 100) * 327)} 327`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-3xl font-semibold">{display}</div>
          <div className="text-xs opacity-80">/100</div>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">ATS Score</div>
            <div className="text-2xl font-bold">Grade {grade}</div>
            <div className="text-sm opacity-80 mt-1">{status}</div>
          </div>
          <div className="flex gap-3">
            <button className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md flex items-center gap-2">
              <Download size={16} /> Download
            </button>
            <button className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md flex items-center gap-2">
              <RefreshCw size={16} /> Reanalyze
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm text-white/90">A quick summary of how your resume performs against common ATS and role-specific signals.</p>
      </div>
    </motion.div>
  );
};

const Pill = ({ children, color = 'bg-slate-700' }) => (
  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${color} text-white/95`}>{children}</span>
);

const SectionCard = ({ title, icon, children, className = '' }) => (
  <motion.section
    initial={{ opacity: 0, y: 6 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.35 }}
    className={`bg-white border border-slate-200 rounded-xl p-4 ${className}`}
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">{icon} {title}</h3>
    </div>
    <div className="text-sm text-slate-700">{children}</div>
  </motion.section>
);

const ResumeAnalysisDashboard = ({ resumeId }) => {
  const dispatch = useDispatch();
  const { currentAnalysis, currentResume, loading } = useSelector((state) => state.resume);

  useEffect(() => {
    if (resumeId) dispatch(getResumeAnalysis(resumeId));
  }, [resumeId, dispatch]);

  if (loading) return <LoadingSpinner />;
  if (!currentAnalysis) return (<div className="p-8 text-center text-slate-700">No analysis data available</div>);

  const { analysis } = currentAnalysis;
  const skillCategories = analysis.skillCategories || [];
  const roleMatch = analysis.roleMatch || [];
  const keywordAnalysis = analysis.keywordAnalysis || { presentKeywords: [], missingKeywords: [], recommendedKeywords: [] };
  const overallScore = analysis.overallScore || { score: 0, grade: 'N/A', summary: 'No score available' };
  const atsScore = analysis.atsScore || { score: 0, strengths: [], weaknesses: [] };
  const achievementList = currentAnalysis.parsedContent?.sections?.achievements || [];
  const linkInfo = currentAnalysis.parsedContent?.sections?.links || {};
  const aiFeedback = analysis.aiFeedback || { strengths: [], weaknesses: [], recommendations: [], actionPlan: [] };

  return (
    <div className="min-h-screen px-6 py-8 bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{currentResume?.name || 'Resume Analysis'}</h1>
            <p className="text-sm text-slate-500 mt-1">Uploaded {currentResume?.uploadedAt || '—'} · Status: {analysis.status || 'Completed'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Pill color="bg-slate-700"><Download size={14} /> Download</Pill>
            <Pill color="bg-slate-700"><RefreshCw size={14} /> Reanalyze</Pill>
            <div className="px-3 py-1 rounded-md bg-white border border-slate-200 text-sm">ATS <strong className="ml-2">{atsScore.score}</strong></div>
          </div>
        </div>

        <div className="mb-6">
          <ScoreHero score={atsScore.score} grade={overallScore.grade} status={overallScore.summary} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SectionCard title="Strengths" icon={<CheckCircle size={16} />}>
                <ul className="space-y-2">
                  {atsScore.strengths.length ? atsScore.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1"><CheckCircle size={18} /></span>
                      <span>{s}</span>
                    </li>
                  )) : <div className="text-sm text-slate-500">No strengths identified</div>}
                </ul>
              </SectionCard>

              <SectionCard title="Areas for Improvement" icon={<AlertTriangle size={16} />}>
                <ul className="space-y-2">
                  {atsScore.weaknesses.length ? atsScore.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-amber-400 mt-1"><AlertTriangle size={18} /></span>
                      <span>{w}</span>
                    </li>
                  )) : <div className="text-sm text-slate-500">Great! No major weaknesses found</div>}
                </ul>
              </SectionCard>
            </div>

            <SectionCard title="Skills Dashboard" icon={<Trophy size={16} />}>
              <div className="flex flex-wrap gap-3">
                {skillCategories.length ? skillCategories.map((cat, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-3 min-w-[160px]">
                    <div className="text-xs text-sky-600 font-semibold">{cat.category}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {cat.items.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-700">{skill}</span>
                      ))}
                    </div>
                  </div>
                )) : <div className="text-sm text-slate-500">No categorized skills found</div>}
              </div>
            </SectionCard>

            <SectionCard title="Role Match" icon={<Trophy size={16} />}>
              <div className="space-y-3">
                {roleMatch.length ? roleMatch.map((r, i) => (
                  <div key={i} className="bg-white border border-slate-100 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{r.role}</div>
                      <div className="text-xs text-slate-500">{r.explanation}</div>
                    </div>
                    <div className="w-36">
                      <div className="text-sm mb-1 text-slate-700">{r.matchScore}%</div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-sky-400" style={{ width: `${r.matchScore}%` }} />
                      </div>
                    </div>
                  </div>
                )) : <div className="text-sm text-slate-500">Role match results are not available</div>}
              </div>
            </SectionCard>

            <SectionCard title="Keyword Analysis" icon={<Github size={16} />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-sky-600 font-semibold mb-2">Present</div>
                  <div className="flex flex-wrap gap-2">{keywordAnalysis.presentKeywords.map((k,i)=>(<span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{k}</span>))}</div>
                </div>
                <div>
                  <div className="text-xs text-amber-600 font-semibold mb-2">Missing</div>
                  <div className="flex flex-wrap gap-2">{keywordAnalysis.missingKeywords.map((k,i)=>(<span key={i} className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">{k}</span>))}</div>
                </div>
                <div>
                  <div className="text-xs text-sky-600 font-semibold mb-2">Recommended</div>
                  <div className="flex flex-wrap gap-2">{keywordAnalysis.recommendedKeywords.map((k,i)=>(<span key={i} className="px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs">{k}</span>))}</div>
                </div>
              </div>
            </SectionCard>

          </div>

          <aside className="space-y-6">
            <SectionCard title="Education" icon={<Globe size={16} />}>
              <div className="space-y-3">
                {(currentAnalysis.parsedContent?.sections?.education || []).map((edu, i) => (
                  <div key={i} className="border-l border-slate-100 pl-3">
                    <div className="font-semibold text-slate-800">{edu.institution}</div>
                    <div className="text-xs text-slate-500">{edu.degree} · {edu.gpa ? `CGPA: ${edu.gpa}` : ''} · {edu.years}</div>
                  </div>
                ))}
                {!currentAnalysis.parsedContent?.sections?.education?.length && <div className="text-sm text-slate-500">No education entries</div>}
              </div>
            </SectionCard>

            <SectionCard title="Achievements" icon={<Trophy size={16} />}>
              <ul className="space-y-2">
                {achievementList.length ? achievementList.map((a,i)=>(<li key={i} className="flex items-center gap-2"><span className="text-amber-400"><Trophy size={16} /></span><span className="text-slate-700">{a.text||a}</span></li>)) : <div className="text-sm text-slate-500">No achievements detected</div>}
              </ul>
            </SectionCard>

            <SectionCard title="Links" icon={<Github size={16} />}>
              <div className="flex flex-col gap-2">
                <a className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900" href={linkInfo.github || '#'}><Github size={14}/> GitHub</a>
                <a className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900" href={linkInfo.linkedIn || '#'}><Linkedin size={14}/> LinkedIn</a>
                <a className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900" href={linkInfo.portfolio || '#'}><Globe size={14}/> Portfolio</a>
              </div>
            </SectionCard>
          </aside>
        </div>

        <div className="mt-6">
          <SectionCard title="Personalized AI Feedback & Action Plan" icon={<CheckCircle size={16} />} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2">Recommendations</h4>
                <ul className="space-y-2 text-sm text-slate-600">{aiFeedback.recommendations.map((r,i)=>(<li key={i}>• {r}</li>))}</ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2">Action Plan</h4>
                <ol className="list-decimal pl-5 text-sm text-slate-600">{aiFeedback.actionPlan.map((a,i)=>(<li key={i}>{a}</li>))}</ol>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysisDashboard;
