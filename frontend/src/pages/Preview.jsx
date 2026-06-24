import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronDown, ZoomIn, ZoomOut, Sparkles,
} from 'lucide-react';
import { getResume, getPreviewHtml, updateResume } from '../api/resumes';
import PreviewControls from '../components/preview/PreviewControls';
import Spinner from '../components/ui/Spinner';

const ZOOM_LEVELS = ['fit', 1, 1.5];

export default function Preview() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [template, setTemplate] = useState(null);
  const [accentColor, setAccentColor] = useState('#3ecf8e');
  const [fontSize, setFontSize] = useState('medium');
  const [hiddenSections, setHiddenSections] = useState([]);
  const [zoom, setZoom] = useState('fit');
  const [showMobileControls, setShowMobileControls] = useState(false);

  const { data: resume, isLoading: resumeLoading } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => getResume(resumeId),
  });

  const previewParams = {
    color_theme: accentColor,
    font_size: fontSize,
    hidden_sections: hiddenSections.length > 0 ? hiddenSections.join(',') : undefined,
  };

  const { data: previewHtml, isLoading: htmlLoading, refetch: refetchPreview } = useQuery({
    queryKey: ['preview-html', resumeId, template, accentColor, fontSize, hiddenSections],
    queryFn: () => getPreviewHtml(resumeId, previewParams),
    enabled: !!resumeId,
  });

  useEffect(() => {
    if (resume?.template && !template) {
      setTemplate(resume.template);
    }
  }, [resume, template]);

  const templateMutation = useMutation({
    mutationFn: (tpl) => updateResume(resumeId, { template: tpl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      refetchPreview();
    },
  });

  const handleTemplateChange = useCallback((tpl) => {
    setTemplate(tpl);
    templateMutation.mutate(tpl);
  }, [templateMutation]);

  const handleToggleSection = useCallback((key) => {
    setHiddenSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const zoomIndex = ZOOM_LEVELS.indexOf(zoom);
  const handleZoomIn = () => {
    if (zoomIndex < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[zoomIndex + 1]);
  };
  const handleZoomOut = () => {
    if (zoomIndex > 0) setZoom(ZOOM_LEVELS[zoomIndex - 1]);
  };

  if (resumeLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas-soft">
        <Spinner />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas-soft">
        <div className="card p-8 text-center scale-in">
          <p className="mb-4 text-ink-mute">Resume not found.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary-green">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-canvas-soft">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-hairline-cool bg-canvas px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/builder/${resumeId}`)}
            className="btn-ghost py-1.5 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <h1 className="truncate text-sm font-medium text-ink">{resume.title}</h1>
          {resume.is_ai_enhanced && (
            <span className="badge-primary gap-1">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-1 rounded-[6px] border border-hairline bg-canvas/50 p-0.5">
            <button onClick={handleZoomOut} disabled={zoomIndex === 0} className="rounded-[6px] p-1.5 text-ink-mute hover:bg-canvas-soft disabled:opacity-30 transition-colors">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[50px] text-center text-xs font-medium text-ink-mute">
              {zoom === 'fit' ? 'Fit' : `${Math.round(zoom * 100)}%`}
            </span>
            <button onClick={handleZoomIn} disabled={zoomIndex === ZOOM_LEVELS.length - 1} className="rounded-[6px] p-1.5 text-ink-mute hover:bg-canvas-soft disabled:opacity-30 transition-colors">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowMobileControls(!showMobileControls)}
            className="btn-ghost py-1.5 text-xs md:hidden"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            Controls
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-r border-hairline-cool bg-canvas p-4 md:block">
          <PreviewControls
            resume={resume}
            resumeId={resumeId}
            template={template}
            onTemplateChange={handleTemplateChange}
            accentColor={accentColor}
            onAccentColorChange={setAccentColor}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            hiddenSections={hiddenSections}
            onToggleSection={handleToggleSection}
            onEdit={() => navigate(`/builder/${resumeId}`)}
          />
        </aside>

        <AnimatePresence>
          {showMobileControls && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm md:hidden"
                onClick={() => setShowMobileControls(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed bottom-0 left-0 right-0 z-40 max-h-[80vh] overflow-y-auto rounded-t-[12px] bg-canvas p-4 shadow-[0_16px_48px_rgba(0,0,0,0.12)] md:hidden"
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-hairline" />
                <PreviewControls
                  resume={resume}
                  resumeId={resumeId}
                  template={template}
                  onTemplateChange={handleTemplateChange}
                  accentColor={accentColor}
                  onAccentColorChange={setAccentColor}
                  fontSize={fontSize}
                  onFontSizeChange={setFontSize}
                  hiddenSections={hiddenSections}
                  onToggleSection={handleToggleSection}
                  onEdit={() => navigate(`/builder/${resumeId}`)}
                  onCloseMobile={() => setShowMobileControls(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex flex-1 items-start justify-center overflow-auto p-4">
          {htmlLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Spinner className="mb-3" />
                <p className="text-sm text-ink-mute">Loading preview...</p>
              </div>
            </div>
          ) : previewHtml ? (
            <div
              className={`shrink-0 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200 ${
                zoom === 'fit' ? 'max-w-[210mm] w-full' : ''
              }`}
            >
              <div
                className={`overflow-hidden rounded-[6px] bg-white ${
                  zoom === 'fit' ? 'scale-[0.7] origin-top' : zoom === 1.5 ? 'scale-150 origin-top' : ''
                }`}
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  transformOrigin: 'top center',
                }}
              >
                <iframe
                  srcDoc={previewHtml}
                  title="Resume Preview"
                  className="h-[297mm] w-full border-0"
                  style={{ pointerEvents: 'none' }}
                />
              </div>
            </div>
          ) : (
            <div className="card py-16 text-center scale-in">
              <p className="mb-4 text-ink-mute">Failed to load preview.</p>
              <button onClick={() => refetchPreview()} className="btn-secondary-outline">
                Retry
              </button>
            </div>
          )}
        </main>
      </div>

      <div className="flex items-center justify-between border-t border-hairline-cool bg-canvas px-4 py-2 md:hidden">
        <button
          onClick={() => setShowMobileControls(true)}
          className="btn-ghost py-1.5 text-xs"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          Controls
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleZoomOut} disabled={zoomIndex === 0} className="rounded p-1.5 text-ink-mute hover:bg-canvas-soft disabled:opacity-30 transition-colors">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium text-ink-mute">
            {zoom === 'fit' ? 'Fit' : `${Math.round(zoom * 100)}%`}
          </span>
          <button onClick={handleZoomIn} disabled={zoomIndex === ZOOM_LEVELS.length - 1} className="rounded p-1.5 text-ink-mute hover:bg-canvas-soft disabled:opacity-30 transition-colors">
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
