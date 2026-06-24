import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { enhanceAll } from '../../api/resumes';
import { Button } from '../ui';

function SectionPreview({ title, children }) {
  if (!children) return null;
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-mute">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="mb-1.5">
      <span className="text-xs font-medium text-ink-mute">{label}: </span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  );
}

export default function ReviewStep({ resume }) {
  const queryClient = useQueryClient();
  const [enhanceProgress, setEnhanceProgress] = useState('');

  const enhanceMutation = useMutation({
    mutationFn: async () => {
      setEnhanceProgress('Enhancing all sections...');
      const result = await enhanceAll(resume.id);
      return result;
    },
    onSuccess: (data) => {
      toast.success(`Enhanced ${data.summaries + data.experiences + data.projects} sections`);
      setEnhanceProgress('');
      queryClient.invalidateQueries({ queryKey: ['resume', resume.id] });
    },
    onError: () => {
      toast.error('Enhancement failed');
      setEnhanceProgress('');
    },
  });

  const pi = resume.personal_info;
  const summary = resume.summary;
  const getSummaryText = () => {
    if (summary?.use_ai_version && summary?.ai_enhanced_text) return summary.ai_enhanced_text;
    return summary?.raw_text;
  };
  const getExpText = (exp) => (exp.use_ai_version && exp.ai_enhanced_description ? exp.ai_enhanced_description : exp.raw_description);
  const getProjText = (proj) => proj.ai_enhanced_description || proj.description;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-medium text-ink">Review &amp; Finalize</h2>
        <Button
          onClick={() => enhanceMutation.mutate()}
          disabled={enhanceMutation.isPending}
        >
          <Sparkles className="h-4 w-4" />
          Enhance All with AI
        </Button>
      </div>

      {enhanceProgress && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 rounded-[6px] bg-primary/5 px-4 py-3 text-sm text-primary"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          {enhanceProgress}
        </motion.div>
      )}

      <div className="rounded-[6px] border border-hairline bg-canvas p-6">
        <SectionPreview title="Personal Info">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Field label="Full Name" value={pi?.full_name} />
              <Field label="Email" value={pi?.email} />
              <Field label="Phone" value={pi?.phone} />
            </div>
            <div>
              <Field label="Location" value={pi?.location} />
              {pi?.linkedin && <Field label="LinkedIn" value={pi.linkedin} />}
              {pi?.github && <Field label="GitHub" value={pi.github} />}
              {pi?.portfolio && <Field label="Portfolio" value={pi.portfolio} />}
            </div>
          </div>
        </SectionPreview>

        <hr className="mb-6 border-hairline" />

        <SectionPreview title="Summary">
          {summary ? (
            <div className="text-sm leading-relaxed text-ink">{getSummaryText()}</div>
          ) : (
            <p className="text-sm text-ink-mute italic">Not filled yet</p>
          )}
        </SectionPreview>

        <hr className="mb-6 border-hairline" />

        <SectionPreview title={`Experience (${resume.experiences?.length || 0})`}>
          {resume.experiences?.map((exp) => (
            <div key={exp.id} className="mb-4 last:mb-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-ink">{exp.job_title}</p>
                  <p className="text-sm text-ink-mute">{exp.company}</p>
                </div>
                <p className="whitespace-nowrap text-xs text-ink-mute">
                  {exp.start_date?.slice(0, 7)} – {exp.is_current ? 'Present' : exp.end_date?.slice(0, 7)}
                </p>
              </div>
              <div className="mt-1 text-sm text-ink-mute whitespace-pre-wrap">{getExpText(exp)}</div>
            </div>
          ))}
          {(!resume.experiences || resume.experiences.length === 0) && (
            <p className="text-sm text-ink-mute italic">No experience added</p>
          )}
        </SectionPreview>

        <hr className="mb-6 border-hairline" />

        <SectionPreview title={`Education (${resume.education?.length || 0})`}>
          {resume.education?.map((edu) => (
            <div key={edu.id} className="mb-3 last:mb-0">
              <p className="font-medium text-ink">{edu.degree}</p>
              <p className="text-sm text-ink-mute">{edu.institution} — {edu.start_year}–{edu.end_year || 'Present'}</p>
              {(edu.gpa || edu.honors) && (
                <p className="text-sm text-ink-mute">{edu.gpa && `GPA: ${edu.gpa}`}{edu.gpa && edu.honors ? ' | ' : ''}{edu.honors}</p>
              )}
            </div>
          ))}
          {(!resume.education || resume.education.length === 0) && (
            <p className="text-sm text-ink-mute italic">No education added</p>
          )}
        </SectionPreview>

        <hr className="mb-6 border-hairline" />

        <SectionPreview title={`Skills (${resume.skills?.length || 0})`}>
          {resume.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span key={skill.id} className="inline-flex items-center gap-1 rounded-full bg-canvas-soft px-3 py-1 text-sm text-ink">
                  {skill.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-mute italic">No skills added</p>
          )}
        </SectionPreview>

        <hr className="mb-6 border-hairline" />

        <SectionPreview title={`Projects (${resume.projects?.length || 0})`}>
          {resume.projects?.map((proj) => (
            <div key={proj.id} className="mb-3 last:mb-0">
              <p className="font-medium text-ink">{proj.title}</p>
              <p className="text-sm text-ink-mute">{proj.tech_stack}</p>
              <p className="mt-1 text-sm text-ink-mute">{getProjText(proj)}</p>
            </div>
          ))}
          {(!resume.projects || resume.projects.length === 0) && (
            <p className="text-sm text-ink-mute italic">No projects added</p>
          )}
        </SectionPreview>

        <hr className="mb-6 border-hairline" />

        <SectionPreview title={`Certifications (${resume.certifications?.length || 0})`}>
          {resume.certifications?.map((cert) => (
            <p key={cert.id} className="mb-1 text-sm text-ink">
              <span className="font-medium">{cert.name}</span> — {cert.issuer}
            </p>
          ))}
          {(!resume.certifications || resume.certifications.length === 0) && (
            <p className="text-sm text-ink-mute italic">No certifications added</p>
          )}
        </SectionPreview>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 rounded-[6px] border border-primary/20 bg-primary/5 px-6 py-4 text-primary">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm font-medium">
          Resume is {resume.completion_percentage}% complete
        </span>
      </div>
    </div>
  );
}
