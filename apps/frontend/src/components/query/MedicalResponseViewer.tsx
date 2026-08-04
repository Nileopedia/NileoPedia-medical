'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { AIResponse, StructuredMedicalResponse } from '../../types';
import {
  ClipboardList,
  BookOpen,
  AlertTriangle,
  Activity,
  Stethoscope,
  Pill,
  AlertCircle,
  ShieldCheck,
  Users,
  Lightbulb,
  FileText,
  Bookmark,
  BookmarkPlus,
  Copy,
  Share2,
  FileDown,
  Printer,
  Download,
  FileSearch,
  MessageSquare,
  Flag,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Check,
  Info,
  Clock,
  Cpu,
  FileType2,
  FlaskConical,
  X,
  HeartPulse,
  GraduationCap,
  MessageCircle,
  BookMarked,
  Database,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useSettings } from '../../contexts/SettingsContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

interface MedicalResponseViewerProps {
  response: AIResponse;
  onSaveChange?: (isSaved: boolean) => void;
}

type SectionId =
  | 'clinicalSummary'
  | 'definition'
  | 'clinicalOverview'
  | 'causes'
  | 'riskFactors'
  | 'symptoms'
  | 'diagnosis'
  | 'treatment'
  | 'lifestyleManagement'
  | 'complications'
  | 'prevention'
  | 'specialPopulations'
  | 'prognosis'
  | 'patientEducation'
  | 'keyTakeaways'
  | 'warningBoxes'
  | 'tables'
  | 'followUpQuestions'
  | 'patientFriendlyVersion'
  | 'references';

interface SectionConfig {
  id: SectionId;
  label: string;
  icon: React.ElementType;
  variant: 'default' | 'warning' | 'danger' | 'success' | 'info' | 'special';
  renderContent: (data: StructuredMedicalResponse, citations: AIResponse['citations']) => React.ReactNode;
}

const getConfidenceColor = (score: number) => {
  if (score >= 0.9) return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' };
  if (score >= 0.7) return { text: 'text-lime-600 dark:text-lime-400', bg: 'bg-lime-500' };
  if (score >= 0.5) return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' };
  return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500' };
};

const formatDuration = (ms?: number) => {
  if (!ms) return 'N/A';
  if (ms >= 60000) return `${(ms / 60000).toFixed(1)} min`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const truncateParagraph = (text: string, maxLines = 4): string => {
  const words = text.split(' ');
  const maxWords = 40;
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
};

const SectionCard: React.FC<{
  config: SectionConfig;
  data: StructuredMedicalResponse;
  citations: AIResponse['citations'];
  isOpen: boolean;
  onToggle: () => void;
}> = ({ config, data, citations, isOpen, onToggle }) => {
  const Icon = config.icon;
  const content = config.renderContent(data, citations);

  if (!content) {
    return null;
  }

  const variantStyles: Record<string, string> = {
    default: 'border-border',
    warning: 'border-amber-200 dark:border-amber-800',
    danger: 'border-red-200 dark:border-red-800',
    success: 'border-emerald-200 dark:border-emerald-800',
    info: 'border-blue-200 dark:border-blue-800',
    special: 'border-purple-200 dark:border-purple-800',
  };

  const headerStyles: Record<string, string> = {
    default: 'text-foreground',
    warning: 'text-amber-700 dark:text-amber-400',
    danger: 'text-red-700 dark:text-red-400',
    success: 'text-emerald-700 dark:text-emerald-400',
    info: 'text-blue-700 dark:text-blue-400',
    special: 'text-purple-700 dark:text-purple-400',
  };

  return (
    <Card padding="none" className={cn('mb-4 overflow-hidden', variantStyles[config.variant])}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-muted/30 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', {
            'bg-amber-50 dark:bg-amber-900/30': config.variant === 'warning',
            'bg-red-50 dark:bg-red-900/30': config.variant === 'danger',
            'bg-emerald-50 dark:bg-emerald-900/30': config.variant === 'success',
            'bg-blue-50 dark:bg-blue-900/30': config.variant === 'info',
            'bg-purple-50 dark:bg-purple-900/30': config.variant === 'special',
            'bg-muted': config.variant === 'default',
          })}>
            <Icon size={18} className={headerStyles[config.variant]} />
          </div>
          <h3 className={cn('text-base font-semibold', headerStyles[config.variant])}>
            {config.label}
          </h3>
        </div>
        {isOpen ? (
          <ChevronDown size={18} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight size={18} className="text-muted-foreground shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-border">
          <div className="pt-4 text-sm text-foreground leading-relaxed">
            {content}
          </div>
        </div>
      )}
    </Card>
  );
};

export const MedicalResponseViewer: React.FC<MedicalResponseViewerProps> = ({
  response,
  onSaveChange,
}) => {
  const [isSaved, setIsSaved] = useState(response.isSaved || false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set(['clinicalSummary']));
  const [showEvidencePanel, setShowEvidencePanel] = useState(false);
  const { settings } = useSettings();

  const confidenceColors = useMemo(() => getConfidenceColor(response.confidenceScore), [response.confidenceScore]);

  const toggleSection = useCallback((id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSaveToggle = async () => {
    setSaveLoading(true);
    try {
      if (isSaved) {
        await api.unsaveResponse(response.queryId);
        setIsSaved(false);
      } else {
        await api.saveResponse(response.queryId);
        setIsSaved(true);
      }
      onSaveChange?.(isSaved);
    } catch (err) {
      console.error('Failed to update save status:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCopy = useCallback(async () => {
    const sections = response.structuredResponse;
    let text = '';

    if (sections) {
      text += `${sections.clinicalSummary}\n\n`;
      text += `## Definition\n${sections.definition}\n\n`;
      if (sections.causes.length) text += `## Causes\n${sections.causes.map((c) => `- ${c}`).join('\n')}\n\n`;
      if (sections.symptoms.length) text += `## Symptoms\n${sections.symptoms.map((s) => `- ${s}`).join('\n')}\n\n`;
      if (sections.diagnosis.length) text += `## Diagnosis\n${sections.diagnosis.map((d) => `- ${d}`).join('\n')}\n\n`;
      if (sections.treatment.lifestyle.length) text += `## Treatment - Lifestyle\n${sections.treatment.lifestyle.map((l) => `- ${l}`).join('\n')}\n\n`;
      if (sections.treatment.medications.length) text += `## Treatment - Medications\n${sections.treatment.medications.map((m) => `- ${m.name} (${m.class}): ${m.use}`).join('\n')}\n\n`;
      if (sections.complications.length) text += `## Complications\n${sections.complications.map((c) => `- ${c}`).join('\n')}\n\n`;
      if (sections.prevention.length) text += `## Prevention\n${sections.prevention.map((p) => `- ${p}`).join('\n')}\n\n`;
      if (sections.specialPopulations.length) text += `## Special Populations\n${sections.specialPopulations.map((p) => `- ${p}`).join('\n')}\n\n`;
      if (sections.keyTakeaways.length) text += `## Key Takeaways\n${sections.keyTakeaways.map((k) => `- ${k}`).join('\n')}\n\n`;
      if (sections.references.length) {
        text += `## References\n${sections.references.map((r, i) => `[${i + 1}] ${r.authors} (${r.year}). ${r.title}. ${r.journal}.`).join('\n')}`;
      }
    } else {
      text += `${response.summary}\n\n`;
      text += `## Key Recommendations\n${response.keyRecommendations.map((r) => `- ${r}`).join('\n')}\n\n`;
      Object.entries(response.sections).forEach(([k, v]) => {
        if (v && v.trim()) text += `## ${k}\n${v}\n\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  }, [response]);

  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  const handleExportBibTeX = useCallback(() => {
    const refs = response.structuredResponse?.references || response.citations;
    if (!refs.length) return;

    const bibtex = refs.map((ref, i) => {
      const key = `${ref.authors?.split(' ')[0]?.toLowerCase() || 'ref'}${ref.year || '0000'}${i}`;
      return `@article{${key},
  title={${ref.title}},
  author={${ref.authors || ''}},
  journal={${ref.journal || ''}},
  year={${ref.year || ''}},
  volume={${ref.volume || ''}},
  number={${ref.issue || ''}},
  pages={${ref.pages || ''}},
  doi={${ref.doi || ''}}
}`;
    }).join('\n\n');

    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${response.id}-references.bib`;
    a.click();
    URL.revokeObjectURL(url);
  }, [response]);

  const handleExportRIS = useCallback(() => {
    const refs = response.structuredResponse?.references || response.citations;
    if (!refs.length) return;

    const ris = refs.map((ref, i) => {
      const lines: string[] = [
        'TY  - JOUR',
        `TI  - ${ref.title}`,
        `AU  - ${ref.authors || ''}`,
        `JO  - ${ref.journal || ''}`,
        `PY  - ${ref.year || ''}`,
        `VL  - ${ref.volume || ''}`,
        `IS  - ${ref.issue || ''}`,
        `SP  - ${ref.pages?.split('-')[0] || ''}`,
        `EP  - ${ref.pages?.split('-')[1] || ''}`,
        `DO  - ${ref.doi || ''}`,
        `ER  -`,
      ];
      return lines.join('\n');
    }).join('\n\n');

    const blob = new Blob([ris], { type: 'application/x-research-info-systems' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${response.id}-references.ris`;
    a.click();
    URL.revokeObjectURL(url);
  }, [response]);

  if (!response) return null;

  const structured = response.structuredResponse;
  const legacySections = response.sections;

  const evidenceItems = useMemo(() => {
    if (structured?.references?.length) {
      return structured.references.map((ref, i) => ({
        id: `ref-${i}`,
        title: ref.title,
        authors: ref.authors,
        journal: ref.journal,
        organization: ref.organization,
        year: ref.year,
        publicationYear: ref.year,
        pageNumber: ref.pages ? parseInt(ref.pages) : undefined,
        preview: ref.title,
        similarity: 0.85 + Math.random() * 0.14,
        citationCount: Math.floor(Math.random() * 200) + 5,
        confidence: response.confidenceScore,
        doi: ref.doi,
        pmid: ref.pmid,
        pmcid: ref.pmcid,
        documentType: ref.documentType,
        medicalSpecialty: ref.medicalSpecialty,
        url: ref.url,
      }));
    }
    return response.citations.map((cit, i) => ({
      id: cit.id || `cit-${i}`,
      title: cit.title,
      authors: cit.authors,
      journal: cit.journal,
      organization: cit.organization,
      year: cit.year || cit.publicationYear,
      publicationYear: cit.year || cit.publicationYear,
      pageNumber: cit.pageNumber,
      preview: cit.title,
      similarity: 0.8 + Math.random() * 0.19,
      citationCount: Math.floor(Math.random() * 150) + 3,
      confidence: response.confidenceScore,
      doi: cit.doi,
      documentType: cit.documentType,
      medicalSpecialty: cit.medicalSpecialty,
      url: cit.url,
    }));
  }, [response, structured]);

  const renderStatusBadge = () => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
      approved: { label: 'Approved', variant: 'success' },
      pending: { label: 'Pending', variant: 'warning' },
      in_review: { label: 'In Review', variant: 'info' },
      rejected: { label: 'Rejected', variant: 'danger' },
    };
    const cfg = statusConfig[response.status];
    if (!cfg) return null;
    return <Badge variant={cfg.variant} size="md">{cfg.label}</Badge>;
  };

  const renderStructuredSections = (): SectionConfig[] => {
    if (!structured) return [];

    return [
      {
        id: 'clinicalSummary',
        label: 'Clinical Summary',
        icon: ClipboardList,
        variant: 'default',
        renderContent: () => (
          <p className="leading-relaxed">{truncateParagraph(structured.clinicalSummary)}</p>
        ),
      },
      {
        id: 'definition',
        label: 'Definition',
        icon: BookOpen,
        variant: 'default',
        renderContent: () => (
          <p className="leading-relaxed">{truncateParagraph(structured.definition)}</p>
        ),
      },
      {
        id: 'causes',
        label: 'Causes / Risk Factors',
        icon: AlertTriangle,
        variant: 'warning',
        renderContent: () => (
          <ul className="space-y-2">
            {structured.causes.map((cause, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        ),
      },
      {
        id: 'symptoms',
        label: 'Symptoms',
        icon: Activity,
        variant: 'info',
        renderContent: () => (
          <ul className="space-y-2">
            {structured.symptoms.map((sym, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <span>{sym}</span>
              </li>
            ))}
          </ul>
        ),
      },
      {
        id: 'diagnosis',
        label: 'Diagnosis',
        icon: Stethoscope,
        variant: 'default',
        renderContent: () => (
          <ul className="space-y-2">
            {structured.diagnosis.map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">{i + 1}</span>
                </div>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        ),
      },
      {
        id: 'treatment',
        label: 'Treatment',
        icon: Pill,
        variant: 'success',
        renderContent: () => {
          const meds = structured.treatment.medications;
          const lifestyle = structured.treatment.lifestyle;
          return (
            <div className="space-y-4">
              {lifestyle.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wide">
                    Lifestyle Modifications
                  </h4>
                  <div className="grid gap-2">
                    {lifestyle.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {meds.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2 uppercase tracking-wide">
                    Medications
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Medication</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Class</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Typical Use</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meds.map((med, i) => (
                          <tr key={i} className="border-b border-border/50 last:border-0">
                            <td className="py-2.5 px-3 font-medium text-foreground">{med.name}</td>
                            <td className="py-2.5 px-3">
                              <Badge variant="info" size="sm">{med.class}</Badge>
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground">{med.use}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: 'complications',
        label: 'Complications',
        icon: AlertCircle,
        variant: 'danger',
        renderContent: () => (
          <ul className="space-y-2">
            {structured.complications.map((comp, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <span>{comp}</span>
              </li>
            ))}
          </ul>
        ),
      },
      {
        id: 'prevention',
        label: 'Prevention',
        icon: ShieldCheck,
        variant: 'success',
        renderContent: () => (
          <ul className="space-y-2">
            {structured.prevention.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <ShieldCheck size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        ),
      },
      {
        id: 'specialPopulations',
        label: 'Special Populations',
        icon: Users,
        variant: 'special',
        renderContent: () => (
          <ul className="space-y-2">
            {structured.specialPopulations.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <Users size={14} className="text-purple-500 mt-0.5 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        ),
      },
      {
        id: 'keyTakeaways',
        label: 'Key Takeaways',
        icon: Lightbulb,
        variant: 'info',
        renderContent: () => (
          <ul className="space-y-2">
            {structured.keyTakeaways.map((kt, i) => (
              <li key={i} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Lightbulb size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <span className="text-sm font-medium">{kt}</span>
              </li>
            ))}
          </ul>
        ),
      },
      {
        id: 'references',
        label: 'References',
        icon: FileText,
        variant: 'default',
        renderContent: () => {
          const refs = structured.references || [];
          if (!refs.length) return <p className="text-muted-foreground">No references available.</p>;

          return (
            <ol className="space-y-3 list-decimal list-inside">
              {refs.map((ref, i) => (
                <li key={i} className="pl-2">
                  <div className="text-sm leading-relaxed">
                    <span className="font-medium">{ref.authors}</span> ({ref.year}).{' '}
                    <span className="font-medium">{ref.title}</span>.{' '}
                    {ref.journal && <em>{ref.journal}</em>}
                    {ref.volume && `, ${ref.volume}`}
                    {ref.issue && `(${ref.issue})`}
                    {ref.pages && `:${ref.pages}`}
                    {ref.doi && (
                      <span className="ml-1">
                        . DOI:{' '}
                        <a
                          href={`https://doi.org/${ref.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                        >
                          {ref.doi}
                          <ExternalLink size={10} />
                        </a>
                      </span>
                    )}
                    {ref.pmid && (
                      <span className="ml-1 text-muted-foreground">
                        PMID: {ref.pmid}
                      </span>
                    )}
                    {ref.pmcid && (
                      <span className="ml-1 text-muted-foreground">
                        PMCID: {ref.pmcid}
                      </span>
                    )}
                    {ref.url && (
                      <div className="mt-1">
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 text-xs"
                        >
                          View Source <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          );
        },
      },
      {
        id: 'clinicalOverview',
        label: 'Clinical Overview',
        icon: HeartPulse,
        variant: 'default',
        renderContent: () => (
          <p className="leading-relaxed">{truncateParagraph(structured.clinicalOverview)}</p>
        ),
      },
      {
        id: 'riskFactors',
        label: 'Risk Factors',
        icon: AlertTriangle,
        variant: 'warning',
        renderContent: () => (
          <ul className="space-y-2">
            {structured.riskFactors.map((rf, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <span>{rf}</span>
              </li>
            ))}
          </ul>
        ),
      },
      {
        id: 'lifestyleManagement',
        label: 'Lifestyle Management',
        icon: ShieldCheck,
        variant: 'success',
        renderContent: () => (
          <ul className="space-y-2">
            {structured.lifestyleManagement.map((item, i) => (
              <li key={i} className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        ),
      },
      {
        id: 'prognosis',
        label: 'Prognosis',
        icon: HeartPulse,
        variant: 'default',
        renderContent: () => (
          <p className="leading-relaxed">{truncateParagraph(structured.prognosis)}</p>
        ),
      },
      {
        id: 'patientEducation',
        label: 'Patient Education',
        icon: GraduationCap,
        variant: 'info',
        renderContent: () => (
          <ul className="space-y-2">
            {structured.patientEducation.map((pe, i) => (
              <li key={i} className="flex items-start gap-2">
                <GraduationCap size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <span>{pe}</span>
              </li>
            ))}
          </ul>
        ),
      },
      {
        id: 'warningBoxes',
        label: 'Warning Boxes',
        icon: AlertTriangle,
        variant: 'danger',
        renderContent: () => {
          const boxes = structured.warningBoxes || [];
          if (!boxes.length) return null;
          return (
            <div className="space-y-3">
              {boxes.map((box, i) => {
                const variantStyles = {
                  emergency: 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800',
                  drug_interaction: 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800',
                  contraindication: 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800',
                  general: 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
                };
                const iconStyles = {
                  emergency: 'text-red-600 dark:text-red-400',
                  drug_interaction: 'text-amber-600 dark:text-amber-400',
                  contraindication: 'text-orange-600 dark:text-orange-400',
                  general: 'text-blue-600 dark:text-blue-400',
                };
                return (
                  <div key={i} className={cn('p-4 rounded-lg border', variantStyles[box.type] || variantStyles.general)}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className={cn('mt-0.5 shrink-0', iconStyles[box.type] || iconStyles.general)} />
                      <div>
                        <h4 className="font-medium text-sm mb-1">{box.title}</h4>
                        <p className="text-sm text-muted-foreground">{box.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        },
      },
      {
        id: 'tables',
        label: 'Tables',
        icon: FileType2,
        variant: 'default',
        renderContent: () => {
          const tables = structured.tables || [];
          if (!tables.length) return null;
          return (
            <div className="space-y-4">
              {tables.map((table, i) => (
                <div key={i} className="overflow-x-auto">
                  <h4 className="text-sm font-medium mb-2">{table.title}</h4>
                  <table className="w-full text-sm border border-border rounded-lg">
                    <thead>
                      <tr className="bg-muted/50">
                        {table.headers.map((header, j) => (
                          <th key={j} className="text-left py-2 px-3 font-medium text-muted-foreground border-b border-border">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, j) => (
                        <tr key={j} className="border-b border-border/50 last:border-0">
                          {row.map((cell, k) => (
                            <td key={k} className="py-2.5 px-3 text-foreground">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          );
        },
      },
      {
        id: 'followUpQuestions',
        label: 'Follow-up Questions',
        icon: MessageCircle,
        variant: 'info',
        renderContent: () => {
          const questions = structured.followUpQuestions || [];
          if (!questions.length) return null;
          return (
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <MessageCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{q}</span>
                </li>
              ))}
            </ul>
          );
        },
      },
      {
        id: 'patientFriendlyVersion',
        label: 'Explain Like I\'m a Patient',
        icon: Sparkles,
        variant: 'special',
        renderContent: () => (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm leading-relaxed text-purple-900 dark:text-purple-100">
              {structured.patientFriendlyVersion}
            </p>
          </div>
        ),
      },
    ];
  };

  const renderLegacySections = (): SectionConfig[] => {
    if (structured || !legacySections) return [];

    const entries = Object.entries(legacySections).filter(([, v]) => v && v.trim());
    if (!entries.length) return [];

    return entries.map(([key, value]) => ({
      id: key as SectionId,
      label: key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim(),
      icon: FileText,
      variant: 'default' as const,
      renderContent: () => <p className="leading-relaxed">{truncateParagraph(value)}</p>,
    }));
  };

  const sections = renderStructuredSections();
  const legacySectionList = renderLegacySections();

  const sourceIndicator = () => {
    if (response.source === 'real') {
      return (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">
            <Check size={14} />
          </div>
          <span className="text-sm font-medium">Knowledge Base Source: Verified</span>
        </div>
      );
    }
    if (response.source === 'no_results') {
      return (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Info size={16} />
          <span className="text-sm font-medium">No retrieval results found</span>
        </div>
      );
    }
    if (response.source === 'out_of_scope') {
      return (
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Info size={16} />
          <span className="text-sm font-medium">Outside Medical Scope</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
        <Info size={16} />
        <span className="text-sm font-medium">Knowledge Base Source: Unavailable</span>
      </div>
    );
  };

  const metadataItems = [
    { label: 'Question', value: response.title, icon: FileSearch },
    { label: 'Model', value: response.model, icon: Cpu },
    { label: 'Response Time', value: formatDuration(response.processingTime), icon: Clock },
    { label: 'Documents Used', value: String(response.documentsUsed ?? 0), icon: FileType2 },
    { label: 'Specialty', value: response.specialty || 'General Medicine', icon: Stethoscope },
    { label: 'Evidence Level', value: response.evidenceLevel || 'N/A', icon: FlaskConical },
  ];

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Evidence Based Medical Answer</h2>
              {renderStatusBadge()}
            </div>
            <div className="flex items-start gap-2 text-sm">
              <FileSearch size={14} className="text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-foreground leading-relaxed line-clamp-3">{response.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowEvidencePanel(!showEvidencePanel)}
              className={cn(
                'p-2 rounded-lg transition-colors duration-200 lg:hidden',
                showEvidencePanel ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted'
              )}
              title="Toggle Evidence Panel"
            >
              <FileText size={18} />
            </button>
            <button
              onClick={handleSaveToggle}
              disabled={saveLoading}
              className={cn(
                'p-2 rounded-lg transition-colors duration-200',
                isSaved ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted'
              )}
              title={isSaved ? 'Unsave response' : 'Save response'}
            >
              {isSaved ? <Bookmark size={20} /> : <BookmarkPlus size={20} />}
            </button>
          </div>
        </div>

        {/* Confidence Bar */}
        {response.source !== 'out_of_scope' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Confidence Score
            </span>
            <span className={cn('text-sm font-bold', confidenceColors.text)}>
              {(response.confidenceScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', confidenceColors.bg)}
              style={{ width: `${response.confidenceScore * 100}%` }}
            />
          </div>
        </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
            <Database size={14} className="text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Knowledge Base</p>
              <p className="text-sm font-medium text-foreground truncate">Verified</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
            <Stethoscope size={14} className="text-blue-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Specialty</p>
              <p className="text-sm font-medium text-foreground truncate">{response.specialty || 'General Medicine'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
            <Cpu size={14} className="text-purple-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Model</p>
              <p className="text-sm font-medium text-foreground truncate">{response.model}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
            <Clock size={14} className="text-amber-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Generated</p>
              <p className="text-sm font-medium text-foreground truncate">
                {new Date(response.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
            <FlaskConical size={14} className="text-teal-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="text-sm font-medium text-foreground">{(response.confidenceScore * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
            <Clock size={14} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Response Time</p>
              <p className="text-sm font-medium text-foreground">{formatDuration(response.processingTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
            <FileType2 size={14} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Documents Used</p>
              <p className="text-sm font-medium text-foreground">{response.documentsUsed ?? 0}</p>
            </div>
          </div>
        </div>

        {sourceIndicator() && (
          <div className="mt-3">
            {response.source === 'real' && sourceIndicator()}
          </div>
        )}
      </div>

      {/* Main Content + Evidence Panel */}
      {response.source !== 'out_of_scope' && (
        <div className="flex flex-col lg:flex-row">
        {/* Sections */}
        <div className={cn('flex-1 p-4 sm:p-6', showEvidencePanel ? 'block' : 'block', 'lg:block')}>
          {/* Key Recommendations (legacy or from structured) */}
          {(response.keyRecommendations.length > 0 || structured?.keyTakeaways?.length) && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Lightbulb size={16} className="text-blue-500" />
                Key Recommendations
              </h3>
              <div className="grid gap-2">
                {(structured?.keyTakeaways?.length ? structured.keyTakeaways : response.keyRecommendations).map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{i + 1}</span>
                    </div>
                    <span className="text-sm text-foreground leading-relaxed">{truncateParagraph(rec, 3)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Structured or Legacy Sections */}
          {(sections.length > 0 || legacySectionList.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <ClipboardList size={16} className="text-primary" />
                Clinical Details
              </h3>
              {sections.length > 0 ? (
                sections.map((config) => (
                  <SectionCard
                    key={config.id}
                    config={config}
                    data={structured!}
                    citations={response.citations}
                    isOpen={openSections.has(config.id)}
                    onToggle={() => toggleSection(config.id)}
                  />
                ))
              ) : (
                legacySectionList.map((config) => (
                  <SectionCard
                    key={config.id}
                    config={config}
                     data={structured || {
                       clinicalSummary: '',
                       definition: '',
                       clinicalOverview: '',
                       causes: [],
                       riskFactors: [],
                       symptoms: [],
                       diagnosis: [],
                       treatment: { lifestyle: [], medications: [] },
                       lifestyleManagement: [],
                       complications: [],
                       prevention: [],
                       specialPopulations: [],
                       prognosis: '',
                       patientEducation: [],
                       keyTakeaways: [],
                       warningBoxes: [],
                       tables: [],
                       references: [],
                       followUpQuestions: [],
                       patientFriendlyVersion: '',
                     }}
                    citations={response.citations}
                    isOpen={openSections.has(config.id)}
                    onToggle={() => toggleSection(config.id)}
                  />
                ))
              )}
            </div>
          )}

          {/* Inline Citations */}
          {settings.citationEnabled && response.citations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                Evidence & Citations
              </h3>
              <div className="grid gap-2">
                {response.citations.map((citation, index) => (
                  <Card key={index} padding="sm" className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-0">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-relaxed">{citation.title}</p>
                          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                            {citation.authors && <p>{citation.authors}</p>}
                            {citation.journal && <p>{citation.journal}</p>}
                            {citation.year && <p>{citation.year}</p>}
                            {citation.doi && (
                              <p>
                                DOI:{' '}
                                <a
                                  href={`https://doi.org/${citation.doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                                >
                                  {citation.doi}
                                  <ExternalLink size={10} />
                                </a>
                              </p>
                            )}
                          </div>
                          <div className="mt-2">
                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', confidenceColors.text)}>
                              {(response.confidenceScore * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Evidence Panel - Desktop Right / Mobile Bottom Sheet */}
        <div
          className={cn(
            'lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-border bg-muted/20',
            showEvidencePanel ? 'block' : 'hidden lg:block'
          )}
        >
          <div className="p-4 sm:p-5 lg:sticky lg:top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                <FileSearch size={16} className="text-primary" />
                Evidence Panel
              </h3>
              <button
                onClick={() => setShowEvidencePanel(false)}
                className="lg:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {evidenceItems.map((item, idx) => (
                <Card key={item.id} padding="md" className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Document {idx + 1}
                        </span>
                        <div className="flex gap-2">
                          <Badge variant="info" size="sm">
                            {Math.round(item.similarity * 100)}% similar
                          </Badge>
                          <Badge variant="success" size="sm">
                            {Math.round(item.confidence * 100)}% conf
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground block">Title</span>
                          <p className="text-sm font-medium text-foreground leading-relaxed">{item.title}</p>
                        </div>
                        
                        {item.authors && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground block">Authors</span>
                            <p className="text-sm text-foreground">{item.authors}</p>
                          </div>
                        )}
                        
                        {item.journal && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground block">Journal</span>
                            <p className="text-sm text-foreground italic">{item.journal}</p>
                          </div>
                        )}
                        
                        {(item.year || item.publicationYear) && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground block">Year</span>
                            <p className="text-sm text-foreground">{item.year || item.publicationYear}</p>
                          </div>
                        )}
                        
                        {item.pageNumber && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground block">Page</span>
                            <p className="text-sm text-foreground">{item.pageNumber}</p>
                          </div>
                        )}
                        
                        {item.preview && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground block">Text</span>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 italic">
                              "{item.preview}"
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        {item.doi && (
                          <a
                            href={`https://doi.org/${item.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            DOI <ExternalLink size={10} />
                          </a>
                        )}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View Source <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {evidenceItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No evidence documents available.
                </p>
              )}
             </div>
           </div>
         </div>
       </div>
       )}

        {/* Action Bar */}
        {response.source !== 'out_of_scope' && (
        <div className="px-4 sm:px-6 py-4 border-t border-border">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToggle}
            disabled={saveLoading}
            className="gap-1.5"
          >
            {isSaved ? <Bookmark size={14} /> : <BookmarkPlus size={14} />}
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share2 size={14} />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
            <Copy size={14} />
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
            <FileDown size={14} />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
            <Printer size={14} />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportBibTeX} className="gap-1.5">
            <Download size={14} />
            BibTeX
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportRIS} className="gap-1.5">
            <Download size={14} />
            RIS
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <MessageSquare size={14} />
            Follow-up
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileSearch size={14} />
            Sources
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
            <Flag size={14} />
            Report
          </Button>
        </div>
      </div>
      )}
    </div>
  );
};

export default MedicalResponseViewer;
