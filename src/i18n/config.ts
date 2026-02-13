export const locales = ['zh-TW', 'en', 'zh-CN'] as const;
export const defaultLocale = 'zh-TW' as const;

export type Locale = (typeof locales)[number];
