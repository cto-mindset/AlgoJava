export type ReleaseChannel = "stable" | "alpha" | "beta" | "prerelease";

export interface ParsedReleaseTag {
  tag: string;
  version: string;
  major: number;
  minor: number;
  patch: number;
  channel: ReleaseChannel;
  isPrerelease: boolean;
  manifestFileName: "latest.json" | "latest-preview.json";
}

export interface DecodedMinisignComment {
  file?: string;
  version?: string;
  trustedComment: string;
}

export interface UpdaterPlatformEntry {
  signature: string;
  url: string;
}

export interface UpdaterManifest {
  version: string;
  notes: string;
  pub_date: string;
  platforms: Record<string, UpdaterPlatformEntry>;
}

export interface VersionAlignmentInput {
  tag: string;
  packageJsonVersion: string;
  tauriConfigVersion: string;
  cargoTomlVersion: string;
  msiVersion?: string;
}

const SEMVER_RE =
  /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

const MSI_VERSION_RE = /^(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?$/;

/**
 * Parses a git release tag (e.g. `v1.0.0`, `v1.0.0-alpha.1`, `v1.0.0-beta.2`)
 * and determines its release channel and updater manifest filename.
 */
export function parseReleaseTag(rawTag: string): ParsedReleaseTag {
  const tag = rawTag.trim();
  const match = SEMVER_RE.exec(tag);
  if (!match) {
    throw new Error(
      `Invalid SemVer release tag "${rawTag}". Expected format like v1.0.0 or v1.0.0-alpha.1.`
    );
  }

  const version = tag.slice(1);
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  const prerelease = match[4];
  if (!prerelease) {
    return {
      tag,
      version,
      major,
      minor,
      patch,
      channel: "stable",
      isPrerelease: false,
      manifestFileName: "latest.json",
    };
  }

  const lower = prerelease.toLowerCase();
  const channel: ReleaseChannel = lower.startsWith("alpha")
    ? "alpha"
    : lower.startsWith("beta")
    ? "beta"
    : "prerelease";

  return {
    tag,
    version,
    major,
    minor,
    patch,
    channel,
    isPrerelease: true,
    manifestFileName: "latest-preview.json",
  };
}

/**
 * Validates that a Windows WiX MSI ProductVersion satisfies MSI numeric limits:
 * major (0..255), minor (0..255), patch (0..65535), optional build (0..65535).
 */
export function validateMsiVersion(msiVersion: string): string[] {
  const errors: string[] = [];
  const trimmed = msiVersion.trim();
  const match = MSI_VERSION_RE.exec(trimmed);
  if (!match) {
    errors.push(
      `Invalid Windows MSI version "${msiVersion}". Expected numeric major.minor.patch[.build].`
    );
    return errors;
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  const build = match[4] !== undefined ? Number(match[4]) : undefined;

  if (major > 255) errors.push(`MSI major version (${major}) must be <= 255.`);
  if (minor > 255) errors.push(`MSI minor version (${minor}) must be <= 255.`);
  if (patch > 65535) errors.push(`MSI patch version (${patch}) must be <= 65535.`);
  if (build !== undefined && build > 65535) {
    errors.push(`MSI build version (${build}) must be <= 65535.`);
  }

  return errors;
}

/**
 * Validates that tag version aligns cleanly with package.json, tauri.conf.json,
 * and Cargo.toml, and verifies the MSI numeric version when supplied.
 */
export function validateVersionAlignment(
  input: VersionAlignmentInput
): string[] {
  const parsed = parseReleaseTag(input.tag);
  const errors: string[] = [];

  if (input.packageJsonVersion !== parsed.version) {
    errors.push(
      `package.json version (${input.packageJsonVersion}) does not match tag version (${parsed.version}).`
    );
  }
  if (input.tauriConfigVersion !== parsed.version) {
    errors.push(
      `src-tauri/tauri.conf.json version (${input.tauriConfigVersion}) does not match tag version (${parsed.version}).`
    );
  }
  if (input.cargoTomlVersion !== parsed.version) {
    errors.push(
      `src-tauri/Cargo.toml version (${input.cargoTomlVersion}) does not match tag version (${parsed.version}).`
    );
  }

  if (parsed.isPrerelease && !input.msiVersion) {
    errors.push(
      `Prerelease version "${parsed.version}" requires bundle.windows.wix.version for Windows MSI packaging.`
    );
  }

  if (input.msiVersion) {
    const msiErrors = validateMsiVersion(input.msiVersion);
    errors.push(...msiErrors);
    if (msiErrors.length === 0) {
      const m = MSI_VERSION_RE.exec(input.msiVersion.trim());
      if (m) {
        const mMajor = Number(m[1]);
        const mMinor = Number(m[2]);
        const mPatch = Number(m[3]);
        const mBuild = m[4] !== undefined ? Number(m[4]) : undefined;
        if (
          mMajor !== parsed.major ||
          mMinor !== parsed.minor ||
          mPatch !== parsed.patch
        ) {
          errors.push(
            `bundle.windows.wix.version (${input.msiVersion}) base major.minor.patch must match tag version (${parsed.major}.${parsed.minor}.${parsed.patch}).`
          );
        }
        if (!parsed.isPrerelease && mBuild !== undefined && mBuild !== 0) {
          errors.push(
            `Stable release tag (${parsed.tag}) must not use non-zero MSI 4th build field (${input.msiVersion}).`
          );
        }
      }
    }
  }

  return errors;
}

/**
 * Decodes Tauri's base64-wrapped minisign signature and extracts trusted comment
 * key/value pairs (`timestamp`, `file`, `version`).
 */
export function parseMinisignTrustedComment(
  sigBase64: string
): DecodedMinisignComment {
  const decoded = atob(sigBase64.trim());
  const lines = decoded.trim().split(/\r?\n/);
  if (lines.length < 3 || !lines[2].startsWith("trusted comment:")) {
    throw new Error("Invalid minisign signature structure (missing trusted comment).");
  }

  const trustedComment = lines[2].slice("trusted comment:".length).trim();
  const fields = trustedComment.split("\t");
  let file: string | undefined;
  let version: string | undefined;
  for (const field of fields) {
    if (field.startsWith("file:")) {
      file = field.slice("file:".length);
    } else if (field.startsWith("version:")) {
      version = field.slice("version:".length);
    }
  }
  return { file, version, trustedComment };
}

/**
 * Validates a base64-encoded Tauri/minisign Ed25519 public key format without
 * relying on external secrets.
 */
export function isValidTauriPublicKey(pubkey: string): boolean {
  const trimmed = pubkey.trim();
  if (!trimmed || trimmed.includes("REPLACE_WITH")) {
    return false;
  }
  try {
    const decoded = atob(trimmed);
    const lines = decoded.trim().split(/\r?\n/);
    return (
      lines.length >= 2 &&
      lines[0].startsWith("untrusted comment:") &&
      lines[1].startsWith("RW") &&
      lines[1].length >= 40
    );
  } catch {
    return false;
  }
}

export interface BuildManifestInput {
  version: string;
  notes: string;
  pubDate: string;
  owner: string;
  repo: string;
  tag: string;
  nsisFileName: string;
  nsisSignature: string;
  msiFileName: string;
  msiSignature: string;
}

/**
 * Builds the canonical Tauri 2 static JSON updater manifest for Windows MSI and NSIS targets.
 */
export function buildUpdaterManifest(
  input: BuildManifestInput
): UpdaterManifest {
  const baseUrl = `https://github.com/${input.owner}/${input.repo}/releases/download/${encodeURIComponent(
    input.tag
  )}`;

  const nsisEntry: UpdaterPlatformEntry = {
    signature: input.nsisSignature.trim(),
    url: `${baseUrl}/${encodeURIComponent(input.nsisFileName)}`,
  };
  const msiEntry: UpdaterPlatformEntry = {
    signature: input.msiSignature.trim(),
    url: `${baseUrl}/${encodeURIComponent(input.msiFileName)}`,
  };

  return {
    version: input.version,
    notes: input.notes.trim(),
    pub_date: input.pubDate,
    platforms: {
      "windows-x86_64-nsis": nsisEntry,
      "windows-x86_64-msi": msiEntry,
      "windows-x86_64": { ...nsisEntry },
    },
  };
}

/**
 * Validates a generated Tauri 2 updater manifest against security and schema invariants.
 */
export function validateUpdaterManifest(
  manifest: UpdaterManifest,
  expectedOwner: string,
  expectedRepo: string
): string[] {
  const errors: string[] = [];

  try {
    parseReleaseTag(`v${manifest.version}`);
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  const parsedDate = Date.parse(manifest.pub_date);
  if (!Number.isFinite(parsedDate) || !manifest.pub_date.endsWith("Z")) {
    errors.push(`pub_date must be an ISO-8601 UTC timestamp (got "${manifest.pub_date}").`);
  }

  const expectedPrefix = `https://github.com/${expectedOwner}/${expectedRepo}/releases/download/`;
  for (const target of [
    "windows-x86_64-nsis",
    "windows-x86_64-msi",
    "windows-x86_64",
  ]) {
    const entry = manifest.platforms[target];
    if (!entry) {
      errors.push(`Missing required platform entry "${target}".`);
      continue;
    }
  if (!entry.url.startsWith(expectedPrefix)) {
      errors.push(
        `Platform "${target}" URL must start with "${expectedPrefix}" (got "${entry.url}").`
      );
    }
    if (!entry.signature || entry.signature.trim().length < 32) {
      errors.push(`Platform "${target}" signature is missing or too short.`);
    }
  }

  const nsisUrl = manifest.platforms["windows-x86_64-nsis"]?.url;
  const msiUrl = manifest.platforms["windows-x86_64-msi"]?.url;
  const fallbackUrl = manifest.platforms["windows-x86_64"]?.url;
  if (nsisUrl && !nsisUrl.endsWith("-setup.exe")) {
    errors.push(`windows-x86_64-nsis URL must point to a -setup.exe asset (${nsisUrl}).`);
  }
  if (msiUrl && !msiUrl.endsWith(".msi")) {
    errors.push(`windows-x86_64-msi URL must point to an .msi asset (${msiUrl}).`);
  }
  if (nsisUrl && fallbackUrl && nsisUrl !== fallbackUrl) {
    errors.push("windows-x86_64 fallback URL must match windows-x86_64-nsis URL.");
  }

  return errors;
}
