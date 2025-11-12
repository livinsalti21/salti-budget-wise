import { useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SaveSnapUploadProps {
  onPhotoUploaded: (photoUrl: string) => void;
  onPhotoRemoved: () => void;
  currentPhotoUrl?: string;
}

export default function SaveSnapUpload({ onPhotoUploaded, onPhotoRemoved, currentPhotoUrl }: SaveSnapUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentPhotoUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WEBP image');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('save-snaps')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('save-snaps')
        .getPublicUrl(data.path);

      onPhotoUploaded(publicUrl);
      toast.success('Photo uploaded! 📸');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
      setPreview(undefined);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onPhotoRemoved();
  };

  if (preview) {
    return (
      <div className="relative rounded-lg overflow-hidden border-2 border-primary/20">
        <img 
          src={preview} 
          alt="Save snap" 
          className="w-full h-48 object-cover"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleRemove}
          disabled={uploading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors">
        {uploading ? (
          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
        ) : (
          <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground">
          {uploading ? 'Uploading...' : 'Add a photo to your save (optional)'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG, or WEBP • Max 5MB
        </p>
      </div>
    </label>
  );
}
