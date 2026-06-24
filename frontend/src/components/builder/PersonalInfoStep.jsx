import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X } from 'lucide-react';
import { updateResume } from '../../api/resumes';
import Input from '../ui/Input';

const schema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(1, 'Phone number is required'),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
});

const PHOTO_KEY = (id) => `resume_${id}_photo`;

export default function PersonalInfoStep({ resumeId, personalInfo, onSave }) {
  const queryClient = useQueryClient();
  const [photoPreview, setPhotoPreview] = useState(() => {
    return localStorage.getItem(PHOTO_KEY(resumeId)) || null;
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const saveTimer = useRef(null);

  const updateMutation = useMutation({
    mutationFn: (data) => updateResume(resumeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
    },
  });

  const {
    register,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: personalInfo?.full_name || '',
      email: personalInfo?.email || '',
      phone: personalInfo?.phone || '',
      location: personalInfo?.location || '',
      linkedin: personalInfo?.linkedin || '',
      github: personalInfo?.github || '',
      portfolio: personalInfo?.portfolio || '',
    },
  });

  const debouncedSave = useCallback(
    (data) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        onSave({ personal_info: data });
      }, 1000);
    },
    [onSave],
  );

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (!name) return;
      debouncedSave(values);
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedSave]);

  const uploadPhoto = (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      setPhotoPreview(dataUrl);
      localStorage.setItem(PHOTO_KEY(resumeId), dataUrl);
      updateMutation.mutate({ personal_info: { ...getValues(), profile_photo: dataUrl } });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadPhoto(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) uploadPhoto(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPhotoPreview(null);
    localStorage.removeItem(PHOTO_KEY(resumeId));
    updateMutation.mutate({ personal_info: { ...getValues(), profile_photo: null } });
  };

  return (
    <div>
      <h2 className="mb-6 text-xl font-medium text-ink">Personal Information</h2>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <label className="label">Profile photo</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-[6px] border-2 border-dashed transition-all ${
              isDragging ? 'border-primary bg-primary/5' : 'border-hairline-strong hover:border-ink-mute'
            }`}
          >
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="Preview" className="h-full w-full rounded-[6px] object-cover" />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm hover:bg-white transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-ink-mute" />
                </button>
              </>
            ) : (
              <>
                <Upload className="mb-2 h-8 w-8 text-ink-mute" />
                <p className="text-sm text-ink-mute">Drop photo here</p>
                <p className="text-xs text-ink-faint">or click to browse</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name *" placeholder="John Doe" error={errors.full_name?.message} {...register('full_name')} />
            <Input label="Email *" type="email" placeholder="john@example.com" error={errors.email?.message} {...register('email')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Phone *" placeholder="+1 (555) 000-0000" error={errors.phone?.message} {...register('phone')} />
            <Input label="Location" placeholder="San Francisco, CA" {...register('location')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/..." {...register('linkedin')} />
            <Input label="GitHub URL" placeholder="https://github.com/..." {...register('github')} />
          </div>
          <Input label="Portfolio URL" placeholder="https://yourportfolio.com" {...register('portfolio')} />
        </div>
      </div>
    </div>
  );
}
