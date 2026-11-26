export type Difficulty = "Easy" | "Medium" | "Hard";
export type ProblemStatus = "not_started" | "attempted" | "solved";
export type SubmissionStatus =
  | "passed"
  | "failed"
  | "compile_error"
  | "runtime_error"
  | "timeout";

export type ThemeMode = "dark" | "light" | "system";
export type AccentColor = "violet" | "blue" | "emerald" | "orange" | "amber";
export type UiFontFamily = "outfit" | "jost" | "inter";
export type FontScale = "sm" | "md" | "lg";
export type EditorFontFamily = "jetbrains-mono" | "geist-mono" | "google-sans-code";
export type TabSizeOption = 2 | 4 | 8;

export interface AppSettings {
  userName: string;
  theme: ThemeMode;
  accentColor: AccentColor;
  fontFamily: UiFontFamily;
  fontSize: FontScale;
  sidebarCollapsed: boolean;
  animations: boolean;

  editorFontFamily: EditorFontFamily;
  editorFontSize: number;
  tabSize: TabSizeOption;
  lineNumbers: boolean;
  bracketPairColorization: boolean;
  wordWrap: boolean;
  minimap: boolean;
  autoIndent: boolean;
  autoSave: boolean;

  customJdkPath: string;
  executionTimeoutSeconds: number;
  memoryLimitMb: number;

  autoOpenNextProblem: boolean;
  showHintsByDefault: boolean;
  showTestResultsAutomatically: boolean;
  confirmBeforeResettingCode: boolean;
  rememberLastCategory: boolean;
  showSolvedProblems: boolean;
  lastCategoryId: string | null;
}

export interface CategorySummary {
  id: string;
  name: string;
  description: string;
  icon: string;
  accentColor: string;
  isFeatured: boolean;
  sortOrder: number;
  totalProblems: number;
  solvedProblems: number;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemListItem {
  id: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  sortOrder: number;
  status: ProblemStatus;
  bookmarked: boolean;
  attemptsCount: number;
  bestRuntimeMs: number | null;
}

export interface TestCase {
  id: number;
  problemId: string;
  caseNumber: number;
  displayInput: string;
  inputArgsJson: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface UserProblemProgress {
  problemId: string;
  status: ProblemStatus;
  bookmarked: boolean;
  draftCode: string | null;
  notes: string | null;
  attemptsCount: number;
  solvedCount: number;
  bestRuntimeMs: number | null;
  firstSolvedAt: string | null;
  lastAttemptedAt: string | null;
  updatedAt: string;
}

export interface SimilarProblemRef {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  status: ProblemStatus;
}

export interface ProblemDetail {
  id: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  title: string;
  summary: string;
  description: string;
  difficulty: Difficulty;
  methodName: string;
  methodSignature: string;
  parameterTypes: string[];
  returnType: string;
  starterCode: string;
  solutionCode: string;
  solutionExplanation: string;
  examples: ProblemExample[];
  constraints: string[];
  hints: string[];
  tags: string[];
  sortOrder: number;
  visibleTestCases: TestCase[];
  allTestCasesCount: number;
  progress: UserProblemProgress | null;
  similarProblems: SimilarProblemRef[];
}

export interface SubmissionRecord {
  id: string;
  problemId: string;
  problemSlug?: string;
  problemTitle?: string;
  categoryName?: string;
  sourceCode: string;
  status: SubmissionStatus;
  passedCount: number;
  totalCount: number;
  executionTimeMs: number;
  compilerOutput: string;
  stdout: string;
  stderr: string;
  submittedAt: string;
}

export interface JdkInfo {
  detected: boolean;
  version: string | null;
  majorVersion: number | null;
  jdkPath: string | null;
  javacPath: string | null;
  javaPath: string | null;
  source: string;
  warning: string | null;
}

export interface ExecutionConfig {
  customJdkPath: string | null;
  timeoutSeconds: number;
  memoryLimitMb: number;
}

export interface TestCaseSpecDto {
  id: number;
  caseNumber: number;
  displayInput: string;
  inputArgsJson: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface ExecutionRequest {
  sourceCode: string;
  methodName: string;
  methodSignature: string;
  parameterTypes: string[];
  returnType: string;
  testCases: TestCaseSpecDto[];
  config: ExecutionConfig;
}

export interface CompilerDiagnostic {
  line: number | null;
  column: number | null;
  message: string;
}

export interface TestCaseResultDto {
  testCaseId: number;
  caseNumber: number;
  displayInput: string;
  expectedOutput: string;
  actualOutput: string | null;
  passed: boolean;
  errorMessage: string | null;
  executionTimeMs: number;
  isHidden: boolean;
}

export interface ExecutionOutcome {
  status: SubmissionStatus;
  compiled: boolean;
  compilerOutput: string;
  diagnostics: CompilerDiagnostic[];
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number;
  timedOut: boolean;
  outputTruncated: boolean;
  passedCount: number;
  totalCount: number;
  testResults: TestCaseResultDto[];
}

export interface StorageInfo {
  storageDir: string;
  cacheDir: string;
  dbFilePath: string;
  dbSizeBytes: number;
  cacheSizeBytes: number;
}

export interface ClearCacheResult {
  clearedBytes: number;
  removedEntries: number;
}

export interface AppBuildInfo {
  appVersion: string;
  buildDate: string;
  tauriVersion: string;
  rustEdition: string;
  targetOs: string;
  targetArch: string;
  buildProfile: string;
}

export interface DatabaseTableStat {
  tableName: string;
  rowCount: number;
}

export interface DatabaseDetails {
  schemaVersion: number;
  tables: DatabaseTableStat[];
}

export interface RecentActivityItem {
  id: string;
  problemId: string;
  problemSlug: string;
  problemTitle: string;
  categoryName: string;
  status: SubmissionStatus;
  passedCount: number;
  totalCount: number;
  executionTimeMs: number;
  submittedAt: string;
}

export interface DashboardData {
  categories: CategorySummary[];
  totalProblems: number;
  solvedProblems: number;
  overallPercentage: number;
  totalAttempts: number;
  currentStreakDays: number;
  recentActivity: RecentActivityItem[];
  nextRecommendedSlug: string | null;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  currentValue: number;
  targetValue: number;
  tone: "emerald" | "violet" | "amber" | "blue";
}

export interface DailyActivityPoint {
  date: string;
  label: string;
  attempts: number;
  passed: number;
}

export interface ProgressPageData {
  totalProblems: number;
  solvedProblems: number;
  weeklySolvedDelta: number;
  totalAttempts: number;
  weeklyAttemptsDelta: number;
  overallPercentage: number;
  successRate: number;
  totalExecutionTimeMs: number;
  currentStreakDays: number;
  categories: CategorySummary[];
  achievements: AchievementItem[];
  recentActivity: RecentActivityItem[];
  dailyHistory: DailyActivityPoint[];
}

export interface ProgressExportBundle {
  schemaVersion: 1;
  appName: "AlgoJava";
  exportedAt: string;
  userProgress: Array<{
    problemId: string;
    status: ProblemStatus;
    bookmarked: boolean;
    draftCode: string | null;
    notes: string | null;
    attemptsCount: number;
    solvedCount: number;
    bestRuntimeMs: number | null;
    firstSolvedAt: string | null;
    lastAttemptedAt: string | null;
    updatedAt: string;
  }>;
  submissions: Array<{
    id: string;
    problemId: string;
    sourceCode: string;
    status: SubmissionStatus;
    passedCount: number;
    totalCount: number;
    executionTimeMs: number;
    compilerOutput: string;
    stdout: string;
    stderr: string;
    submittedAt: string;
  }>;
}
