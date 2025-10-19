import { ui, defaultLang } from './ui'

export function getLangFromUrl(url: URL) {
	const [, lang] = url.pathname.split('/')
	if (lang in ui) return lang as keyof typeof ui
	return defaultLang
}

export function useTranslations(lang: keyof typeof ui) {
	return function t(key: string) {
		return getNestedValue(ui[lang], key) || getNestedValue(ui[defaultLang], key)
	}
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
	return path.split('.').reduce<unknown>((prev, curr) => {
		if (prev && typeof prev === 'object' && curr in prev) {
			return (prev as Record<string, unknown>)[curr]
		}
		return null
	}, obj)
}

export function getTranslatedPath(path: string, lang: string) {
	const pathWithoutLeadingSlash = path.startsWith('/') ? path.slice(1) : path

	if (pathWithoutLeadingSlash === '') {
		if (lang === defaultLang) return '/'
		return `/${lang}/`
	}

	if (lang === defaultLang) return `/${pathWithoutLeadingSlash}`
	return `/${lang}/${pathWithoutLeadingSlash}`
}
