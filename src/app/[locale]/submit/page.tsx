'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_TAGS } from '@/types';
import { CodeEditor } from '@/components/code-editor';
import { ImageUpload } from '@/components/image-upload';
import { useAuth } from '@/components/auth-provider';
import { LoginButton } from '@/components/login-button';

export default function SubmitPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('Submit');
  const tTags = useTranslations('Tags');
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'url' | 'code'>('url');

  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  // URL mode
  const [url, setUrl] = useState('');

  // Code mode
  const [codeHtml, setCodeHtml] = useState('');
  const [codeCss, setCodeCss] = useState('');
  const [codeJs, setCodeJs] = useState('');
  const [detecting, setDetecting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      if (prev.length >= 3) {
        toast({ title: t('maxTags'), variant: 'destructive' });
        return prev;
      }
      return [...prev, tag];
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: t('titleRequired'), variant: 'destructive' });
      return;
    }
    if (selectedTags.length === 0) {
      toast({ title: t('tagRequired'), variant: 'destructive' });
      return;
    }
    if (mode === 'url' && !url.trim()) {
      toast({ title: t('urlRequired'), variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        type: mode,
        url: mode === 'url' ? url.trim() : undefined,
        code_html: mode === 'code' ? codeHtml : undefined,
        code_css: mode === 'code' ? codeCss : undefined,
        code_js: mode === 'code' ? codeJs : undefined,
        preview_image_url: previewImageUrl || undefined,
        is_anonymous: isAnonymous,
        tags: selectedTags,
      };

      const res = await fetch('/api/slops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      toast({ title: t('submitSuccess') });
      router.push(`/slop/${data.slop.id}`);
    } catch (error) {
      toast({
        title: t('submitFailed'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <h1 className="text-3xl font-bold">{t('pageTitle')}</h1>
          <p className="text-muted-foreground">{t('loginPrompt')}</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{t('pageTitle')}</h1>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <Label htmlFor="title">{t('titleLabel')}</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('titlePlaceholder')}
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">{t('descriptionLabel')}</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('descriptionPlaceholder')}
            rows={3}
          />
        </div>

        {/* Tags */}
        <div>
          <Label>{t('tagsLabel')}</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {DEFAULT_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer text-sm px-3 py-1"
                onClick={() => toggleTag(tag)}
              >
                {tTags.has(tag) ? tTags(tag) : tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Mode Tabs */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'url' | 'code')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">{t('urlTab')}</TabsTrigger>
            <TabsTrigger value="code">{t('codeTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div>
              <Label htmlFor="url">{t('urlLabel')}</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!url.trim() || detecting}
                  onClick={async () => {
                    setDetecting(true);
                    try {
                      const res = await fetch(`/api/og-image?url=${encodeURIComponent(url.trim())}`);
                      const data = await res.json();
                      if (data.imageUrl) {
                        setPreviewImageUrl(data.imageUrl);
                        toast({ title: t('submitSuccess').replace('!', '') });
                      } else {
                        toast({ title: t('noOgImage'), variant: 'destructive' });
                      }
                    } catch {
                      toast({ title: t('noOgImage'), variant: 'destructive' });
                    } finally {
                      setDetecting(false);
                    }
                  }}
                  className="whitespace-nowrap"
                >
                  {detecting ? t('detecting') : t('autoDetect')}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <CodeEditor
              html={codeHtml}
              css={codeCss}
              js={codeJs}
              onHtmlChange={setCodeHtml}
              onCssChange={setCodeCss}
              onJsChange={setCodeJs}
            />
          </TabsContent>
        </Tabs>

        {/* Preview Image Upload */}
        <div>
          <Label>{t('previewImage')}</Label>
          <ImageUpload value={previewImageUrl} onChange={setPreviewImageUrl} />
        </div>

        {/* Anonymous */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(!!checked)}
          />
          <Label htmlFor="anonymous" className="cursor-pointer">
            {t('anonymous')}
          </Label>
        </div>

        {/* Submit */}
        <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">
          {loading ? t('submitting') : t('submitButton')}
        </Button>
      </div>
    </div>
  );
}
