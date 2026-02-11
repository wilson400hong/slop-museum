'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function SubmitPage() {
  const router = useRouter();
  const { toast } = useToast();
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

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      if (prev.length >= 3) {
        toast({ title: '最多選擇 3 個標籤', variant: 'destructive' });
        return prev;
      }
      return [...prev, tag];
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: '請輸入作品標題', variant: 'destructive' });
      return;
    }
    if (selectedTags.length === 0) {
      toast({ title: '請至少選擇 1 個標籤', variant: 'destructive' });
      return;
    }
    if (mode === 'url' && !url.trim()) {
      toast({ title: '請輸入作品 URL', variant: 'destructive' });
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

      toast({ title: '作品提交成功！' });
      router.push(`/slop/${data.slop.id}`);
    } catch (error) {
      toast({
        title: '提交失敗',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">提交作品</h1>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <Label htmlFor="title">作品標題 *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="給你的作品取個名字"
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">作品簡介</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="簡單介紹一下你的作品..."
            rows={3}
          />
        </div>

        {/* Tags */}
        <div>
          <Label>標籤 * (選擇 1-3 個)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {DEFAULT_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer text-sm px-3 py-1"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Mode Tabs */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'url' | 'code')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">URL 提交</TabsTrigger>
            <TabsTrigger value="code">Code Snippet 提交</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div>
              <Label htmlFor="url">作品連結 *</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
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
          <Label>預覽圖</Label>
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
            匿名發布
          </Label>
        </div>

        {/* Submit */}
        <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">
          {loading ? '提交中...' : '提交作品'}
        </Button>
      </div>
    </div>
  );
}
