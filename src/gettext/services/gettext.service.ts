import { Injectable } from '@angular/core';
import { TranslationsCache } from '../translations-cache';

@Injectable()
export class GettextService {
    private translations: Record<string, Record<string, string>> = {};
    private currentLanguage: string;
    private currentLanguageTranslations: Record<string, string> = {};

    private interpolationRegex: RegExp;

    private debugMode = false;
    private debugPrefix = '[MISSING] ';
    private debugSuffix = '';

    public constructor() {
        this.setInterpolationMarkers('[[', ']]');
    }

    public setDebugMode(enable: boolean, prefix?: string, suffix?: string): void {
        this.debugMode = enable;
        if (prefix) {
            this.debugPrefix = prefix;
        }
        if (suffix) {
            this.debugSuffix = suffix;
        }
    }

    public setInterpolationMarkers(prefix: string, suffix: string): void {
        this.interpolationRegex = new RegExp(this.escapeRegex(prefix) + '(.+?)' + this.escapeRegex(suffix), 'g');
    }

    public getString(key: string, interpolations?: Record<string, unknown>): string {
        let translatedString = this.currentLanguageTranslations[key];
        if (translatedString === undefined) {
            translatedString = key;
            if (this.debugMode) {
                translatedString = `${this.debugPrefix}${translatedString}${this.debugSuffix}`;
            }
        }

        if (interpolations) {
            return translatedString.replace(
                this.interpolationRegex,
                (_, replacement) => interpolations[replacement] as string
            );
        }
        return translatedString;
    }

    public getCurrentLanguage(): string {
        return this.currentLanguage;
    }

    public setCurrentLanguage(language: string): void {
        this.currentLanguage = language;
        this.currentLanguageTranslations = this.translations[language] || {};
    }

    public setTranslations(translationsCache: TranslationsCache): void;
    public setTranslations(language: string, translations: Record<string, string>): void;
    public setTranslations(
        languageOrTranslationsCache: string | TranslationsCache,
        translations?: Record<string, string>
    ): void {
        if (typeof languageOrTranslationsCache === 'string') {
            this.translations[languageOrTranslationsCache] = {
                ...this.translations[languageOrTranslationsCache],
                ...translations
            };
            if (languageOrTranslationsCache === this.currentLanguage) {
                this.currentLanguageTranslations = this.translations[languageOrTranslationsCache] || {};
            }
        } else {
            languageOrTranslationsCache.forEach(({ language, strings }) => this.setTranslations(language, strings));
        }
    }

    // SO FTW https://stackoverflow.com/a/6969486
    private escapeRegex(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
