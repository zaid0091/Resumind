import { useState } from 'react';
import { Download, Share2, Edit3, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getPreviewHtml } from '../../api/resumes';
import ResumeScore from './ResumeScore';
import Button from '../ui/Button';

const TEMPLATES = [
  {
    id: 'modern', label: 'Modern', desc: 'Two-column',
    preview: <div className="flex h-12 overflow-hidden rounded-[6px] border border-hairline"><div className="w-1/3 bg-canvas-night" /><div className="flex-1 bg-white" /></div>,
  },
  {
    id: 'classic', label: 'Classic', desc: 'Traditional',
    preview: <div className="h-12 rounded-[6px] border border-hairline bg-white" />,
  },
  {
    id: 'minimal', label: 'Minimal', desc: 'Clean',
    preview: <div className="h-12 rounded-[6px] border border-hairline bg-canvas-soft"><div className="mx-auto mt-3 h-0.5 w-8 rounded bg-hairline-strong" /></div>,
  },
];

const ACCENT_COLORS = [
  { label: 'Emerald', value: '#3ecf8e' },
  { label: 'Blue', value: '#2563EB' },
  { label: 'Green', value: '#059669' },
  { label: 'Purple', value: '#7C3AED' },
  { label: 'Rose', value: '#E11D48' },
  { label: 'Teal', value: '#0D9488' },
];

const FONT_SIZES = [
  { label: 'S', value: 'small' },
  { label: 'M', value: 'medium' },
  { label: 'L', value: 'large' },
];

const SECTIONS = [
  { key: 'summary', label: 'Summary' },
  { key: 'experience', label: 'Experience' },
  { key: 'education', label: 'Education' },
  { key: 'skills', label: 'Skills' },
  { key: 'projects', label: 'Projects' },
  { key: 'certifications', label: 'Certifications' },
];

export default function PreviewControls({
  resume,
  resumeId,
  template,
  onTemplateChange,
  accentColor,
  onAccentColorChange,
  fontSize,
  onFontSizeChange,
  hiddenSections,
  onToggleSection,
  onEdit,
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const params =
        accentColor !== '#3ecf8e' || fontSize !== 'medium' || hiddenSections.length
          ? { color_theme: accentColor.replace('#', ''), font_size: fontSize, hidden_sections: hiddenSections.join(',') }
          : undefined;
      const html = await getPreviewHtml(resumeId, params);

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '0';
      iframe.style.top = '0';
      iframe.style.width = '794px';
      iframe.style.height = '1123px';
      iframe.style.border = 'none';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.style.zIndex = '-1';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      await new Promise((resolve) => {
        iframe.onload = resolve;
        setTimeout(resolve, 3000);
      });
      await new Promise((resolve) => setTimeout(resolve, 500));

      const body = iframe.contentWindow.document.body;
      const canvas = await html2canvas(body, {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        width: 794,
        height: Math.max(body.scrollHeight, 1123),
        windowWidth: 794,
        windowHeight: Math.max(body.scrollHeight, 1123),
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      let renderWidth, renderHeight;
      if (ratio > pdfWidth / pdfHeight) {
        renderWidth = pdfWidth;
        renderHeight = pdfWidth / ratio;
      } else {
        renderHeight = pdfHeight;
        renderWidth = pdfHeight * ratio;
      }
      const x = (pdfWidth - renderWidth) / 2;
      const y = (pdfHeight - renderHeight) / 2;
      pdf.addImage(imgData, 'JPEG', x, y, renderWidth, renderHeight);
      pdf.save(`${resume?.title || 'resume'}.pdf`);

      document.body.removeChild(iframe);
      toast.success('Your resume has been downloaded!');
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/preview/${resumeId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Share link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="label text-xs uppercase tracking-wider">Template</p>
        <div className="grid grid-cols-3 gap-1.5">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onTemplateChange(tpl.id)}
              className={`rounded-[6px] border-2 p-2 text-left transition-all ${
                template === tpl.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-hairline hover:border-hairline-strong'
              }`}
            >
              <div className="mb-1.5 overflow-hidden rounded-[6px]">{tpl.preview}</div>
              <p className="text-xs font-medium text-ink">{tpl.label}</p>
              <p className="text-[10px] text-ink-mute">{tpl.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {template === 'modern' && (
        <div>
          <p className="label text-xs uppercase tracking-wider">Accent Color</p>
          <div className="flex gap-2">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onAccentColorChange(c.value)}
                className={`h-7 w-7 rounded-full transition-all ${
                  accentColor === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="label text-xs uppercase tracking-wider">Font Size</p>
        <div className="flex gap-1 rounded-[6px] bg-canvas-soft p-0.5">
          {FONT_SIZES.map((fs) => (
            <button
              key={fs.value}
              type="button"
              onClick={() => onFontSizeChange(fs.value)}
              className={`flex-1 rounded-[6px] px-3 py-1.5 text-sm font-medium transition-all ${
                fontSize === fs.value
                  ? 'bg-canvas text-ink shadow-sm'
                  : 'text-ink-mute hover:text-ink'
              }`}
            >
              {fs.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label text-xs uppercase tracking-wider">Sections</p>
        <div className="space-y-1">
          {SECTIONS.map((sec) => {
            const isHidden = hiddenSections.includes(sec.key);
            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => onToggleSection(sec.key)}
                className={`flex w-full items-center justify-between rounded-[6px] px-3 py-2 text-sm transition-all ${
                  isHidden
                    ? 'text-ink-mute hover:bg-canvas-soft'
                    : 'text-ink hover:bg-primary/5'
                }`}
              >
                <span>{sec.label}</span>
                {isHidden ? (
                  <EyeOff className="h-3.5 w-3.5 text-ink-faint" />
                ) : (
                  <Eye className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <ResumeScore resume={resume} />

      <div className="space-y-2 pt-2">
        <Button className="w-full" onClick={handleDownload} disabled={isDownloading}>
          <Download className="h-4 w-4" />
          {isDownloading ? 'Generating PDF...' : 'Download PDF'}
        </Button>
        <Button variant="secondary" className="w-full" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Share Link
        </Button>
        <Button variant="secondary" className="w-full" onClick={onEdit}>
          <Edit3 className="h-4 w-4" />
          Edit Resume
        </Button>
      </div>
    </div>
  );
}
