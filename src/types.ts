export type ScreenId =
  | 'axon'
  | 'tools'
  | 'code'
  | 'codebase'
  | 'automation'
  | 'video_editor'
  | 'notes'
  | 'storage'
  | 'settings'
  | 'account'
  | 'notifications'
  | 'tool_text'
  | 'tool_calc'
  | 'tool_units'
  | 'tool_colors'
  | 'tool_images'
  | 'tool_files'
  | 'tool_speech_rate'
  | 'tool_bible'
  | 'tool_interface_capture';

export type PaneViewState = 'chat-only' | 'split' | 'workspace-only';

export type AIProvider = 'gemini' | 'claude' | 'chatgpt' | 'axon';
export type AICallMode = 'offline' | 'single' | 'multi';

export interface GeneralSettings {
  deleteConfirmationWaitTimerSeconds: number; // default 5, adjustable 0-10
  deleteConfirmationTimerEnabled: boolean; // default true, if false instant deletion
  userReadingSpeedWpm: number; // default 200, user adjustable
  aiCallMode: AICallMode; // 'offline' | 'single' | 'multi'
}

export interface AIAccount {
  id: string;
  provider: AIProvider;
  label: string; // e.g. "Account A", "Account B", "Personal", "Work"
  apiKey: string;
  isActive: boolean;
  isRateLimited?: boolean;
  cooldownUntil?: number; // timestamp in ms (up to 24 hours)
  lastError?: string;
  createdAt: string;
}

export interface AIModelOption {
  id: string;
  name: string;
  provider: AIProvider;
  providerName: string;
  badge: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  systemContext?: string; // Specific instructions, objectives, or guidelines scoped to this project
  color?: string;
  icon?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NoteCategory =
  | 'general'
  | 'code'
  | 'prompt'
  | 'spec'
  | 'meeting'
  | 'idea'
  | 'architecture'
  | 'extracted_chat';

export interface ContextualMessageAction {
  label: string;
  actionText: string;
  destinationId?: string;
  targetId?: string;
  category?: string;
  description?: string;
  intent?: 'open' | 'confirm' | 'cancel' | 'retry' | 'execute' | string;
  payload?: any;
  icon?: string;
  variant?: 'default' | 'secondary' | 'danger' | 'ghost' | string;
}

export type ChatCommandOption = ContextualMessageAction;

export interface ChatAttachment {
  name: string;
  type: string;
  size?: string;
  dataUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'axon' | 'system';
  text: string;
  timestamp: string;
  projectId?: string; // Scoped project ID for per-project memory isolation
  modelUsed?: string;
  accountUsed?: string;
  providerUsed?: AIProvider;
  isStreaming?: boolean;
  isError?: boolean;
  isRateLimitedNotice?: boolean;
  hasBuildRunResult?: boolean;
  isResultUnavailable?: boolean;
  commandName?: string;
  attachment?: ChatAttachment;
  attachments?: ChatAttachment[];
  actions?: ContextualMessageAction[];
  commandOptions?: ContextualMessageAction[];
}

export interface NavHistoryEntry {
  id: string;
  screen: ScreenId;
  timestamp?: number;
  options?: any;
  screenState?: Record<string, any>;
  scrollPositions?: ScrollPositionMap;
  isMenuOpen?: boolean;
  activePanel?: string | null;
  panelPayload?: any;
  paneViewState?: PaneViewState;
  splitRatio?: number;
}

export interface QueuedTask {
  id: string;
  name?: string;
  text?: string;
  attachment?: any;
  attachments?: any[];
  status?: 'pending' | 'running' | 'completed' | 'failed';
  timestamp?: number;
  projectId?: string;
  createdAt?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  projectId?: string; // Associated project ID or 'global'
  tags?: string[];
  isPinned?: boolean;
  category?: NoteCategory;
  createdAt: string;
  updatedAt: string;
}

export type IconPreset = 'axon-orb' | 'axon-minimal' | 'axon-neural' | 'axon-cyber';
export type AppNameTextCase = 'uppercase' | 'lowercase' | 'titlecase' | 'standard';

export function formatAppNameCase(textCase?: AppNameTextCase | string, baseName = 'AXON'): string {
  const mode = typeof textCase === 'string' ? textCase.toLowerCase() : 'uppercase';
  if (mode === 'lowercase') return 'axon';
  if (mode === 'titlecase') return 'Axon';
  if (mode === 'standard') return 'Axon';
  return 'AXON';
}

export interface IconAvatarSettings {
  appIconType: 'preset' | 'custom';
  appIconPreset: IconPreset;
  appIconCustomUrl?: string;
  appNameTextCase?: AppNameTextCase;

  avatarType: 'preset' | 'custom';
  avatarPreset: IconPreset;
  avatarCustomUrl?: string;
  previousAvatarCustomUrl?: string; // for restorable functionality

  syncAppIconAndAvatar: boolean;
  showChatAvatar: boolean;
}

export type ThemeMode = 'dark' | 'light';

export interface FunctionColors {
  [key: string]: string | boolean | any;
}

export interface ThemeSettings {
  mode: ThemeMode;
  accentColor: string; // e.g. '#ffffff', '#3b82f6', '#10b981', '#a855f7'
  palette?: Record<string, string>;
  functionColors?: FunctionColors;
}

export type CodeSkillLevel = 'guided' | 'assisted' | 'developer' | 'expert';

export interface SavedScript {
  id: string;
  title: string;
  code: string;
  language: 'shorthand' | 'javascript' | 'python' | 'html' | string;
  skillLevel?: CodeSkillLevel;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface KnowledgePackLesson {
  id: string;
  title: string;
  category: string;
  description: string;
  shorthandCode?: string;
  realCode: string;
  language: 'javascript' | 'python' | 'html' | 'shell';
  explanation: string;
  practicalTip: string;
}

export interface KnowledgePack {
  id: string;
  title: string;
  version: string;
  isBasePack: boolean; // Base pack cannot be deleted
  description: string;
  icon: string;
  lessons: KnowledgePackLesson[];
}

export interface ExecutionResult {
  output: string;
  error?: string;
  returnVal?: any;
  executionTimeMs: number;
  memoryEstimateKb: number;
  timestamp: string;
  renderHtml?: string;
}

export interface TranslatedCommand {
  userQuery: string;
  detectedIntent: string;
  commandOrCode: string;
  language: string;
  explanation: string;
  why: string;
  relatedLessonId?: string;
}

// PART 5: Automation Rules Engine Types
export type RuleTriggerType =
  | 'connection_error'
  | 'model_error'
  | 'rate_limit'
  | 'keyword_match'
  | 'code_execution_error'
  | 'message_sent'
  | 'storage_limit_near'
  | 'custom_event';

export type RuleActionType =
  | 'retry_automatically'
  | 'switch_account'
  | 'notify_user'
  | 'auto_format_code'
  | 'execute_run_code'
  | 'append_instruction'
  | 'save_to_notes'
  | 'trim_storage';

export interface AutomationRule {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  triggerType: RuleTriggerType;
  triggerLabel: string;
  triggerCondition: string;
  actionType: RuleActionType;
  actionLabel: string;
  actionConfig: {
    maxRetries?: number;
    targetAccountId?: string;
    targetAccountLabel?: string;
    customMessage?: string;
    runCodeEntryId?: string;
    instructionPayload?: string;
  };
  plainLanguagePrompt?: string;
  creationMode: 'plain_language' | 'guided_form';
  createdAt: string;
  updatedAt: string;
  triggerCount: number;
  lastTriggered?: string;
  lastExecutionLog?: string;
}

// PART 5: Run Code Layer (Live Behavior Extension Layer)
export type RunCodeHookPoint =
  | 'pre_prompt'          // Intercepts and transforms incoming user prompts before API dispatch
  | 'post_response'       // Post-processes AI responses before rendering
  | 'custom_command'      // Intercepts custom slash command (e.g. /stats, /format)
  | 'runtime_interceptor' // System behavior overrides
  | 'standalone';         // Standalone execution script

export interface RunCodeEntry {
  id: string;
  title: string;
  description: string;
  category?: 'prompt_filter' | 'response_modifier' | 'custom_command' | 'behavior_extension' | 'system_override' | 'utility';
  hookPoint: RunCodeHookPoint;
  commandKeyword?: string;
  code: string;
  language?: 'javascript' | 'axon_instructions';
  enabled: boolean;
  author?: string;
  version?: string;
  executionCount: number;
  lastExecuted?: string;
  lastOutput?: string;
  createdAt: string;
  updatedAt: string;
}

// PART 7: Asset Manifest, Compression & Storage Diagnostics Types
export type AssetCategory =
  | 'model'
  | 'knowledge_pack'
  | 'user_file'
  | 'chat_history'
  | 'cache'
  | 'system';

export type SaveMode = 'archive' | 'space_saver';

export type QualityState =
  | 'original'
  | 'lossless'
  | 'downsampled'
  | 'enhanced'
  | 'enhanced_approximation';

export type KnowledgeStatus = 'current' | 'stale' | 'not_applicable';

export interface AssetRevertLog {
  timestamp: string;
  action: 'enhanced' | 'reverted_lossless' | 'reverted_approximation' | 'switched_mode';
  note: string;
}

export interface AssetManifestItem {
  id: string;
  name: string;
  category: AssetCategory;
  storageLocation: string; // Exact path/URI: e.g. "/local/models/gemini-flash.bin"
  mimeType: string;
  originalSizeBytes: number; // Exact integer byte count
  storedSizeBytes: number;   // Exact stored byte count
  allocatedSizeBytes?: number;
  saveMode: SaveMode;        // 'archive' (lossless original preserved) vs 'space_saver' (lossy/downsampled, original discarded)
  isOriginalPreserved: boolean;
  qualityState: QualityState;
  knowledgeStatus: KnowledgeStatus;
  staleReason?: string;
  description?: string;
  projectId?: string;
  isCore?: boolean;
  isEnabled?: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  revertHistory?: AssetRevertLog[];
}

export type TrimCategoryPriority =
  | 'cache'
  | 'stale_knowledge'
  | 'downsampled_user_files'
  | 'chat_history'
  | 'knowledge_packs'
  | 'knowledge_pack'
  | 'models'
  | 'model'
  | 'user_file'
  | 'user_files';

export interface StorageBudgetConfig {
  budgetBytes: number; // Default: 15 GB = 16,106,127,360 bytes
  budgetMode?: 'preset_15gb' | 'custom' | 'detected';
  customLimitBytes?: number;
  trimPriority: TrimCategoryPriority[];
  warningThresholdPercent: number; // e.g. 85%
  autoTrimOnBudgetNear?: boolean;
  autoTrimEnabled?: boolean;
  hasCompletedOnboarding?: boolean;
}

export type WorkspaceCodeLoadMode = 'manual' | 'auto' | 'ask';

export interface WorkspaceSnippetHistoryItem {
  id: string;
  title: string;
  code: string;
  language?: string;
  timestamp: string | number;
  lineCount?: number;
  byteSize?: number;
  source?: string;
}

export type WorkspaceMode = 'code' | 'preview' | 'split' | 'console' | 'html' | 'javascript' | 'json';

export interface FormattedTraceback {
  errorName: string;
  errorMessage: string;
  lineNumber: number | null;
  columnNumber: number | null;
  fileName: string;
  codeSnippet: string;
  fullTraceback: string;
}

export type ScrollPositionMap = Record<string, any>;

export type PendingInteractionType = 'suggestion' | 'confirmation' | 'disambiguation' | 'input' | string;
export type ExpectedResponseType = 'confirmation' | 'selection' | 'text' | 'any' | string;

export interface PendingInteraction<TTarget = any, TCandidate = any> {
  id?: string;
  type?: 'suggestion' | 'confirmation' | 'disambiguation' | 'input' | string;
  command?: string;
  promptType?: 'confirm' | 'select' | string;
  originatingIntent?: string;
  target?: TTarget;
  candidates?: TCandidate[];
  timestamp: number;
  createdAt?: number;
  ttlMs?: number;
  expiresAt?: number;
  metadata?: Record<string, any>;
}

// File Intelligence Types
export type FileIntelligenceType =
  | 'document'
  | 'code'
  | 'image'
  | 'audio'
  | 'video'
  | 'archive'
  | 'data'
  | 'other';

export interface FileIndexEntry {
  id: string;
  name: string;
  fileType: FileIntelligenceType;
  mimeType: string;
  sizeBytes: number;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  extractedSummary?: string;
  keywords?: string[];
  tags?: string[];
}

export interface FileSearchQuery {
  term?: string;
  naturalLanguageQuery?: string;
  fileTypes?: FileIntelligenceType[];
  projectId?: string;
  maxResults?: number;
  limit?: number;
  minScore?: number;
  tags?: string[];
}

export interface FileSearchResult {
  entry: FileIndexEntry;
  file?: FileIndexEntry;
  matchScore: number;
  score?: number;
  matchedFields?: string[];
  matchedReasons?: string[];
  excerpt?: string;
}

// Project Timeline Types
export type ProjectActivityType =
  | 'project_created'
  | 'project_switched'
  | 'note_created'
  | 'note_updated'
  | 'note_deleted'
  | 'script_saved'
  | 'script_executed'
  | 'code_executed'
  | 'tool_used'
  | 'message_sent'
  | 'rule_created'
  | 'rule_toggled'
  | 'asset_registered'
  | 'budget_adjusted'
  | 'telemetry_run'
  | 'other';

export interface ProjectActivityEvent {
  id: string;
  projectId: string;
  timestamp: string;
  dateString: string;
  timeString: string;
  type: ProjectActivityType;
  title: string;
  summary: string;
  metadata?: Record<string, any>;
}

export interface ProjectTimelineQuery {
  projectId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  types?: ProjectActivityType[];
  searchTerm?: string;
  limit?: number;
}

export interface AppStateData {
  settings: {
    theme: ThemeSettings;
    icons: IconAvatarSettings;
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    aiAccounts: AIAccount[];
    activeModelId: string;
    codeSkillLevel?: CodeSkillLevel;
    activeProjectId?: string;
    storageBudget?: StorageBudgetConfig;
    generalSettings?: GeneralSettings;
  };
  projects?: ProjectItem[];
  projectActivities?: ProjectActivityEvent[];
  messages: ChatMessage[];
  notes: NoteItem[];
  assetManifest?: AssetManifestItem[];
  userContent: {
    customFiles: Array<{ id: string; name: string; type: string; size: string; date: string }>;
    savedScripts?: SavedScript[];
    automationRules?: AutomationRule[];
    runCodeEntries?: RunCodeEntry[];
  };
}
