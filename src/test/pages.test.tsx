import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ProblemsPage } from "@/features/problems/ProblemsPage";
import { ProgressPage } from "@/features/progress/ProgressPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { AboutPage } from "@/features/about/AboutPage";
import { DEFAULT_SETTINGS, useSettingsStore } from "@/stores/settingsStore";

const mockGetDashboardData = vi.fn();
const mockGetProgressPageData = vi.fn();
const mockGetCategoriesWithProgress = vi.fn();
const mockGetProblems = vi.fn();
const mockClearAppCache = vi.fn();
const mockGetStorageInfo = vi.fn();

vi.mock("@/lib/db/progressRepository", () => ({
  getDashboardData: (...args: unknown[]) => mockGetDashboardData(...args),
  getProgressPageData: (...args: unknown[]) => mockGetProgressPageData(...args),
  getDatabaseDetails: vi.fn().mockResolvedValue({ schemaVersion: 2, tables: [] }),
  exportProgressBundle: vi.fn(),
  importProgressBundle: vi.fn(),
  resetAllProgress: vi.fn(),
}));

vi.mock("@/lib/db/categoryRepository", () => ({
  getCategoriesWithProgress: (...args: unknown[]) =>
    mockGetCategoriesWithProgress(...args),
}));

vi.mock("@/lib/db/problemRepository", () => ({
  getProblems: (...args: unknown[]) => mockGetProblems(...args),
}));

vi.mock("@/lib/tauri/storageClient", () => ({
  getStorageInfo: (...args: unknown[]) => mockGetStorageInfo(...args),
  clearAppCache: (...args: unknown[]) => mockClearAppCache(...args),
  exportProgressFile: vi.fn(),
  importProgressFile: vi.fn(),
  getAppBuildInfo: vi.fn().mockResolvedValue({
    appVersion: "1.0.1",
    buildDate: "2026.11.27",
    tauriVersion: "2.12.7",
    rustEdition: "2024",
    targetOs: "windows",
    targetArch: "x86_64",
    buildProfile: "test",
  }),
}));

vi.mock("@/lib/tauri/updaterClient", () => ({
  checkForAppUpdate: vi.fn().mockResolvedValue({
    status: "not_configured",
    errorKind: "not_configured",
    message: "Offline build",
  }),
  downloadAndInstallPendingUpdate: vi.fn(),
  clearPendingUpdate: vi.fn(),
  restartApplication: vi.fn(),
  isUpdaterConfigured: vi.fn().mockResolvedValue(false),
  sanitizeUpdaterError: vi.fn().mockReturnValue({
    kind: "unknown",
    message: "Update error",
  }),
  checkForUpdatesSafely: vi.fn().mockResolvedValue({
    status: "not_configured",
    message: "Offline build",
  }),
}));

describe("AlgoJava Application Pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, userName: "Dilshod" },
      hydrated: true,
    });

    mockGetStorageInfo.mockResolvedValue({
      storageDir: "C:\\Users\\Test\\AppData\\Roaming\\uz.awe.algojava",
      cacheDir: "C:\\Users\\Test\\AppData\\Local\\uz.awe.algojava",
      dbFilePath: "C:\\Users\\Test\\AppData\\Roaming\\uz.awe.algojava\\algojava.db",
      dbSizeBytes: 65536,
      cacheSizeBytes: 2048,
    });

    mockClearAppCache.mockResolvedValue({
      clearedBytes: 2048,
      removedEntries: 2,
    });
  });

  it("renders DashboardPage with database stats and empty activity state", async () => {
    mockGetDashboardData.mockResolvedValue({
      categories: [
        {
          id: "warmup",
          name: "Warmup",
          description: "Beginner level problems",
          icon: "rocket",
          accentColor: "#10b981",
          isFeatured: true,
          sortOrder: 1,
          totalProblems: 10,
          solvedProblems: 2,
        },
      ],
      totalProblems: 47,
      solvedProblems: 2,
      overallPercentage: 4,
      totalAttempts: 5,
      currentStreakDays: 1,
      recentActivity: [],
      nextRecommendedSlug: "sum-of-two-numbers",
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Dilshod!")).toBeInTheDocument();
    expect(screen.getByText("2 / 10")).toBeInTheDocument();
    expect(screen.getByText("4%")).toBeInTheDocument();
    expect(screen.getByText("No activity yet")).toBeInTheDocument();
    expect(screen.getByText("Sum Of Two Numbers")).toBeInTheDocument();

    const tipButton = screen.getByRole("button", { name: "Next Java tip" });
    fireEvent.click(tipButton);
    expect(tipButton).toBeInTheDocument();
  });

  it("renders ProblemsPage and passes search & difficulty filters to repository", async () => {
    mockGetCategoriesWithProgress.mockResolvedValue([
      {
        id: "warmup",
        name: "Warmup",
        description: "Beginner level problems",
        icon: "rocket",
        accentColor: "#10b981",
        isFeatured: true,
        sortOrder: 1,
        totalProblems: 10,
        solvedProblems: 1,
      },
    ]);
    mockGetProblems.mockResolvedValue([
      {
        id: "warmup-01",
        slug: "sum-of-two-numbers",
        categoryId: "warmup",
        categoryName: "Warmup",
        title: "Sum of Two Numbers",
        summary: "Given two integers, return their sum.",
        difficulty: "Easy",
        sortOrder: 1,
        status: "solved",
        bookmarked: false,
        attemptsCount: 1,
        bestRuntimeMs: 12,
      },
    ]);

    render(
      <MemoryRouter initialEntries={["/problems"]}>
        <Routes>
          <Route path="/problems" element={<ProblemsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Sum of Two Numbers")).toBeInTheDocument();
    expect(screen.getByText("12 ms")).toBeInTheDocument();

    const search = screen.getByLabelText("Search problems");
    fireEvent.change(search, { target: { value: "Sum" } });

    await waitFor(() => {
      expect(mockGetProblems).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "Sum" })
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Easy" }));

    await waitFor(() => {
      expect(mockGetProblems).toHaveBeenLastCalledWith(
        expect.objectContaining({ difficulty: "Easy", search: "Sum" })
      );
    });
  });

  it("switches settings tabs and requires confirmation in SettingsPage before clearing temporary cache", async () => {
    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MemoryRouter>
    );

    const tablist = screen.getByRole("tablist", { name: "Settings sections" });
    expect(tablist).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Appearance" })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    const uiFontSelect = screen.getByLabelText("UI Font Family") as HTMLSelectElement;
    expect(uiFontSelect.value).toBe("outfit");
    fireEvent.change(uiFontSelect, { target: { value: "jost" } });
    await waitFor(() => {
      expect(useSettingsStore.getState().settings.fontFamily).toBe("jost");
    });

    fireEvent.click(screen.getByRole("tab", { name: "Storage" }));
    expect(await screen.findByText("Data & Storage")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear Cache" }));
    expect(
      screen.getByText("Clear Temporary Execution Cache?")
    ).toBeInTheDocument();

    const buttons = screen.getAllByRole("button", { name: "Clear Cache" });
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(mockClearAppCache).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: "Reset Progress" }));
    expect(screen.getByText("Reset All Progress?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  });

  it("deep-links directly to Settings runtime tab via query param", async () => {
    render(
      <MemoryRouter initialEntries={["/settings?tab=runtime"]}>
        <Routes>
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("tab", { name: "Runtime" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(await screen.findByText("Java Runtime")).toBeInTheDocument();
  });

  it("renders AboutPage story, creator details, privacy policy, and security notice", async () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <Routes>
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Local Execution Security/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Dilshod Fayzullayev")).toBeInTheDocument();
    expect(screen.getByText("Dylan")).toBeInTheDocument();
    expect(screen.getAllByText(/codingbat\.com/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Voluntary diagnostics only:/i)
    ).toBeInTheDocument();
  });

  it("renders ProgressPage with database-derived metrics and achievements", async () => {
    mockGetProgressPageData.mockResolvedValue({
      totalProblems: 47,
      solvedProblems: 12,
      weeklySolvedDelta: 4,
      totalAttempts: 18,
      weeklyAttemptsDelta: 6,
      overallPercentage: 26,
      successRate: 67,
      totalExecutionTimeMs: 4200,
      currentStreakDays: 3,
      categories: [
        {
          id: "warmup",
          name: "Warmup",
          description: "Beginner level problems",
          icon: "rocket",
          accentColor: "#10b981",
          isFeatured: true,
          sortOrder: 1,
          totalProblems: 10,
          solvedProblems: 5,
        },
      ],
      achievements: [
        {
          id: "first-steps",
          title: "First Steps",
          description: "Solve your first problem",
          unlocked: true,
          currentValue: 1,
          targetValue: 1,
          tone: "emerald",
        },
      ],
      recentActivity: [],
      dailyHistory: [{ date: "2026-11-25", label: "Nov 25", attempts: 2, passed: 1 }],
    });

    render(
      <MemoryRouter initialEntries={["/progress"]}>
        <Routes>
          <Route path="/progress" element={<ProgressPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("67% pass rate")).toBeInTheDocument();
    expect(screen.getByText("26%")).toBeInTheDocument();
    expect(screen.getByText("First Steps")).toBeInTheDocument();
    expect(screen.getByText("Unlocked")).toBeInTheDocument();
    expect(
      screen.getByText(/Nov 25: 2 attempts · 1 passed/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Needs Focus" }));
    expect(screen.getByRole("button", { name: "Needs Focus" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    fireEvent.click(screen.getByRole("button", { name: /View All/i }));
    expect(screen.getByText("All Achievements")).toBeInTheDocument();
  });
});
