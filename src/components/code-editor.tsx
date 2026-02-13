'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  html: string;
  css: string;
  js: string;
  onHtmlChange: (v: string) => void;
  onCssChange: (v: string) => void;
  onJsChange: (v: string) => void;
}

export function CodeEditor({ html, css, js, onHtmlChange, onCssChange, onJsChange }: Props) {
  const t = useTranslations('CodeEditor');

  const previewSrc = `<!DOCTYPE html>
<html>
<head><style>${css}</style></head>
<body>${html}<script>${js}<\/script></body>
</html>`;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="html">
        <TabsList>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="js">JavaScript</TabsTrigger>
        </TabsList>
        <TabsContent value="html">
          <Textarea
            value={html}
            onChange={(e) => onHtmlChange(e.target.value)}
            placeholder="<div>Hello World</div>"
            className="font-mono text-sm min-h-[200px]"
          />
        </TabsContent>
        <TabsContent value="css">
          <Textarea
            value={css}
            onChange={(e) => onCssChange(e.target.value)}
            placeholder="body { background: #fff; }"
            className="font-mono text-sm min-h-[200px]"
          />
        </TabsContent>
        <TabsContent value="js">
          <Textarea
            value={js}
            onChange={(e) => onJsChange(e.target.value)}
            placeholder="console.log('Hello World');"
            className="font-mono text-sm min-h-[200px]"
          />
        </TabsContent>
      </Tabs>

      <div>
        <p className="text-sm text-muted-foreground mb-2">{t('livePreview')}</p>
        <div className="border rounded-lg overflow-hidden bg-white">
          <iframe
            srcDoc={previewSrc}
            className="w-full h-[300px]"
            sandbox="allow-scripts"
            title="Code Preview"
          />
        </div>
      </div>
    </div>
  );
}
