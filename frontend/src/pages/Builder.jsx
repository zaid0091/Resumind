import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getResume, updateResume } from '../api/resumes';
import StepIndicator from '../components/builder/StepIndicator';
import PersonalInfoStep from '../components/builder/PersonalInfoStep';
import SummaryStep from '../components/builder/SummaryStep';
import ExperienceStep from '../components/builder/ExperienceStep';
import EducationStep from '../components/builder/EducationStep';
import SkillsProjectsStep from '../components/builder/SkillsProjectsStep';
import ReviewStep from '../components/builder/ReviewStep';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const STEPS = [
  { num: 1, component: PersonalInfoStep, props: (r) => ({ personalInfo: r.personal_info }) },
  { num: 2, component: SummaryStep, props: (r) => ({ summary: r.summary }) },
  { num: 3, component: ExperienceStep, props: (r) => ({ experiences: r.experiences }) },
  { num: 4, component: EducationStep, props: (r) => ({ education: r.education }) },
  { num: 5, component: SkillsProjectsStep, props: (r) => ({ skills: r.skills, projects: r.projects }) },
  { num: 6, component: ReviewStep, props: (r) => ({ resume: r }) },
];

export default function Builder() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimerRef = useRef(null);

  const { data: resume, isLoading, isError } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => getResume(resumeId),
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateResume(resumeId, data),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setSaveStatus('saved');
    },
    onError: () => {
      setSaveStatus('saved');
    },
  });

  const mutateRef = useRef(updateMutation.mutate);

  const debouncedSave = useCallback(
    (data) => {
      const trimmed = {};
      for (const [key, val] of Object.entries(data)) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          const clean = Object.fromEntries(
            Object.entries(val).filter(([, v]) => v !== '' && v != null),
          );
          if (Object.keys(clean).length) trimmed[key] = clean;
        } else if (val !== '' && val != null) {
          trimmed[key] = val;
        }
      }
      if (!Object.keys(trimmed).length) return;

      setSaveStatus('unsaved');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        mutateRef.current(trimmed);
      }, 800);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const goToStep = (step) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (isError || !resume) {
    return (
      <div className="py-20 text-center fade-in-up">
        <div className="card inline-block p-8">
          <p className="text-ink-mute mb-4">Resume not found.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const stepDef = STEPS.find((s) => s.num === currentStep);
  const StepComponent = stepDef.component;
  const stepProps = stepDef.props(resume);
  const isFirst = currentStep === 1;
  const isLast = currentStep === 6;

  return (
    <div className="mx-auto max-w-4xl fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="btn-ghost p-2">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <input
              defaultValue={resume.title}
              onBlur={(e) => {
                if (e.target.value !== resume.title) {
                  updateMutation.mutate({ title: e.target.value });
                }
              }}
              className="text-xl font-medium text-ink bg-transparent border-none outline-none focus:ring-0 p-0"
            />
            <p className="text-xs capitalize text-ink-mute">{resume.template} template</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-amber-600">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-primary">
                <Save className="h-3 w-3" /> Saved
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-ink-mute">Unsaved changes</span>
            )}
          </div>

          <Button onClick={() => navigate(`/preview/${resumeId}`)}>
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      <StepIndicator currentStep={currentStep} onStepClick={goToStep} />

      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="card-elevated"
          >
            <StepComponent resumeId={resumeId} onSave={debouncedSave} {...stepProps} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          {!isFirst && (
            <Button variant="secondary" onClick={() => goToStep(currentStep - 1)}>
              ← Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-mute">
            Step {currentStep} of 6
          </span>
          {!isLast ? (
            <Button onClick={() => goToStep(currentStep + 1)}>
              Next →
            </Button>
          ) : (
            <Button onClick={() => navigate(`/preview/${resumeId}`)}>
              <Eye className="h-4 w-4" />
              Preview & Export
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
