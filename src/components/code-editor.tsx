'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import { html as htmlLang } from '@codemirror/lang-html';
import { css as cssLang } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false });

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
  const { resolvedTheme } = useTheme();
  const cmTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

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
          <CodeMirror
            value={html}
            height="200px"
            extensions={[htmlLang()]}
            onChange={onHtmlChange}
            theme={cmTheme}
            placeholder="<div>Hello World</div>"
            className="border rounded-md overflow-hidden"
          />
        </TabsContent>
        <TabsContent value="css">
          <CodeMirror
            value={css}
            height="200px"
            extensions={[cssLang()]}
            onChange={onCssChange}
            theme={cmTheme}
            placeholder="body { background: #fff; }"
            className="border rounded-md overflow-hidden"
          />
        </TabsContent>
        <TabsContent value="js">
          <CodeMirror
            value={js}
            height="200px"
            extensions={[javascript()]}
            onChange={onJsChange}
            theme={cmTheme}
            placeholder="console.log('Hello World');"
            className="border rounded-md overflow-hidden"
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
