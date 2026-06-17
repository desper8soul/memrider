import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { AppConfigService } from "@memrider/shared";
import { AppLogger } from "@memrider/shared/logging";
import {
  PromptManifestSchema,
  type PromptManifest,
  type PromptRenderInput,
  type RenderedPrompt,
} from "./prompt.types";
import { renderTemplate } from "./template.util";

@Injectable()
export class PromptService implements OnModuleInit {
  private readonly context = PromptService.name;
  private readonly cache = new Map<string, PromptManifest>();
  private promptsDir!: string;
  private activeVersion!: string;
  private promptSetName!: string;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit() {
    this.promptSetName = this.appConfigService.prompts.promptSetName;
    this.promptsDir = this.getPromptsDir();
    const manifest = this.loadManifest(this.promptSetName);
    this.activeVersion = this.getVersion(manifest);
    this.logger.log(
      `Prompts loaded from ${this.promptsDir} — ${this.promptSetName}@${this.activeVersion}`,
      this.context,
    );
  }

  getActiveVersion(): string {
    return this.activeVersion;
  }

  getPromptSetName(): string {
    return this.promptSetName;
  }

  listVersions(promptName?: string): string[] {
    return Object.keys(
      this.loadManifest(promptName ?? this.promptSetName).versions,
    );
  }

  getPrompt(input: PromptRenderInput): RenderedPrompt {
    return this.get(this.promptSetName, input, this.activeVersion);
  }

  get(
    promptName: string,
    input: PromptRenderInput,
    version?: string,
  ): RenderedPrompt {
    const manifest = this.loadManifest(promptName);
    const promptVersion = version ?? this.getVersion(manifest);
    const versionMeta = manifest.versions[promptVersion];
    if (!versionMeta) {
      throw new Error(
        `Unknown prompt version "${promptVersion}" for "${promptName}". Available: ${Object.keys(manifest.versions).join(", ")}`,
      );
    }

    const versionDir = join(this.promptsDir, promptName, promptVersion);
    const systemPath = join(versionDir, versionMeta.system);
    const userPath = join(versionDir, versionMeta.user);

    const system = readFileSync(systemPath, "utf-8").trim();
    const userTemplate = readFileSync(userPath, "utf-8").trim();
    const user = renderTemplate(userTemplate, {
      query: input.query,
      memories: input.memories,
    });

    return {
      name: promptName,
      version: promptVersion,
      description: versionMeta.description,
      system,
      user,
    };
  }

  private getVersion(manifest: PromptManifest, override?: string): string {
    const fromEnv = override ?? this.appConfigService.prompts.promptVersion;

    if (!manifest.versions[fromEnv]) {
      throw new Error(
        `Invalid PROMPT_VERSION="${fromEnv}" for "${manifest.name}". Available: ${Object.keys(manifest.versions).join(", ")}`,
      );
    }
    return fromEnv;
  }

  private loadManifest(promptName: string): PromptManifest {
    const cached = this.cache.get(promptName);
    if (cached) return cached;

    const manifestPath = join(this.promptsDir, promptName, "manifest.json");
    const raw = JSON.parse(readFileSync(manifestPath, "utf-8"));
    const manifest = PromptManifestSchema.parse(raw);
    this.cache.set(promptName, manifest);
    return manifest;
  }

  private getPromptsDir(): string {
    const promptsDir = this.appConfigService.prompts.promptsDir;
    const manifestPath = join(promptsDir, this.promptSetName, "manifest.json");

    if (!existsSync(manifestPath)) {
      throw new Error(
        `Prompt registry not found at ${manifestPath}. Check PROMPTS_DIR and PROMPT_SET_NAME.`,
      );
    }

    return promptsDir;
  }
}
