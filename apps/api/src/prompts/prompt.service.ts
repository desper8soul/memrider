import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PromptManifestSchema,
  type PromptManifest,
  type PromptRenderInput,
  type ResolvedPrompt,
} from './prompt.types';
import { renderTemplate } from './template.util';

const PROMPT_SET = 'memory-search';
const VERSION_ENV_KEY = 'PROMPT_MEMORY_SEARCH_VERSION';

@Injectable()
export class PromptService implements OnModuleInit {
  private readonly logger = new Logger(PromptService.name);
  private readonly cache = new Map<string, PromptManifest>();
  private promptsDir!: string;
  private activeVersion!: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.promptsDir = this.resolvePromptsDir();
    const manifest = this.loadManifest(PROMPT_SET);
    this.activeVersion = this.resolveVersion(manifest);
    this.logger.log(
      `Prompts loaded from ${this.promptsDir} — ${PROMPT_SET}@${this.activeVersion}`,
    );
  }

  /** Active version for the memory-search prompt set (from env or manifest default). */
  getActiveVersion(): string {
    return this.activeVersion;
  }

  getPromptSetName(): string {
    return PROMPT_SET;
  }

  listVersions(promptName = PROMPT_SET): string[] {
    return Object.keys(this.loadManifest(promptName).versions);
  }

  resolveMemorySearchPrompt(input: PromptRenderInput): ResolvedPrompt {
    return this.resolve(PROMPT_SET, input, this.activeVersion);
  }

  resolve(
    promptName: string,
    input: PromptRenderInput,
    version?: string,
  ): ResolvedPrompt {
    const manifest = this.loadManifest(promptName);
    const resolvedVersion = version ?? this.resolveVersion(manifest);
    const versionMeta = manifest.versions[resolvedVersion];
    if (!versionMeta) {
      throw new Error(
        `Unknown prompt version "${resolvedVersion}" for "${promptName}". Available: ${Object.keys(manifest.versions).join(', ')}`,
      );
    }

    const versionDir = join(this.promptsDir, promptName, resolvedVersion);
    const systemPath = join(versionDir, versionMeta.system);
    const userPath = join(versionDir, versionMeta.user);

    const system = readFileSync(systemPath, 'utf-8').trim();
    const userTemplate = readFileSync(userPath, 'utf-8').trim();
    const user = renderTemplate(userTemplate, {
      query: input.query,
      memories: input.memories,
    });

    return {
      name: promptName,
      version: resolvedVersion,
      description: versionMeta.description,
      system,
      user,
    };
  }

  private resolveVersion(manifest: PromptManifest, override?: string): string {
    const fromEnv =
      override ??
      this.config.get<string>(VERSION_ENV_KEY) ??
      manifest.defaultVersion;

    if (!manifest.versions[fromEnv]) {
      throw new Error(
        `Invalid ${VERSION_ENV_KEY}="${fromEnv}" for "${manifest.name}". Available: ${Object.keys(manifest.versions).join(', ')}`,
      );
    }
    return fromEnv;
  }

  private loadManifest(promptName: string): PromptManifest {
    const cached = this.cache.get(promptName);
    if (cached) return cached;

    const manifestPath = join(this.promptsDir, promptName, 'manifest.json');
    const raw = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    const manifest = PromptManifestSchema.parse(raw);
    this.cache.set(promptName, manifest);
    return manifest;
  }

  private resolvePromptsDir(): string {
    const override = this.config.get<string>('PROMPTS_DIR');
    if (override && existsSync(override)) {
      return override;
    }

    const candidates = [
      join(process.cwd(), 'prompt-registry'),
      join(process.cwd(), 'apps/api/prompt-registry'),
      join(__dirname, '..', 'prompt-registry'),
      join(__dirname, '../../prompt-registry'),
    ];

    for (const dir of candidates) {
      if (existsSync(join(dir, PROMPT_SET, 'manifest.json'))) {
        return dir;
      }
    }

    throw new Error(
      `Prompt registry not found. Set PROMPTS_DIR or place prompts under apps/api/prompt-registry.`,
    );
  }
}
