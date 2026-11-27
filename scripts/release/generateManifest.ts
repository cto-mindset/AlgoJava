import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import {
  buildUpdaterManifest,
  parseReleaseTag,
  validateUpdaterManifest,
} from "./releaseMetadata";

function getArg(flag: string, fallback?: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }
  return fallback;
}

function findArtifactPair(
  dir: string,
  version: string,
  suffix: string
): { installerPath: string; sigPath: string } {
  if (!existsSync(dir)) {
    throw new Error(`Bundle directory does not exist: ${dir}`);
  }
  const files = readdirSync(dir);
  const matchingInstaller = files.find(
    (name) =>
      name.includes(`_${version}_`) &&
      name.endsWith(suffix) &&
      !name.endsWith(".sig")
  );
  if (!matchingInstaller) {
    throw new Error(
      `Could not find ${suffix} installer for version ${version} in ${dir}`
    );
  }
  const installerPath = join(dir, matchingInstaller);
  const sigPath = `${installerPath}.sig`;
  if (!existsSync(sigPath)) {
    throw new Error(
      `Missing updater signature file: ${sigPath}. Ensure bundle.createUpdaterArtifacts=true and TAURI_SIGNING_PRIVATE_KEY is set.`
    );
  }
  const sigContent = readFileSync(sigPath, "utf8").trim();
  if (!sigContent) {
    throw new Error(`Signature file is empty: ${sigPath}`);
  }
  return { installerPath, sigPath };
}

function sha256File(path: string): string {
  const hash = createHash("sha256");
  hash.update(readFileSync(path));
  return hash.digest("hex");
}

function main() {
  const tag = getArg("--tag");
  if (!tag) {
    throw new Error("Missing required argument: --tag <vX.Y.Z>");
  }

  const parsed = parseReleaseTag(tag);
  const owner = getArg("--owner", "cto-mindset")!;
  const repo = getArg("--repo", "algojava-releases")!;
  const bundleDir = resolve(
    getArg("--bundle-dir", "src-tauri/target/release/bundle")!
  );
  const outDir = resolve(getArg("--out-dir", "release-assets")!);
  const notesFile = getArg("--notes-file");

  const defaultNotes = [
    `AlgoJava ${parsed.tag} (${parsed.channel} channel)`,
    "",
    "- Signed Windows MSI and NSIS installers verified via Ed25519.",
    "- Download AlgoJava only from the official public release repository.",
  ].join("\n");

  const notes =
    notesFile && existsSync(notesFile)
      ? readFileSync(notesFile, "utf8").trim() || defaultNotes
      : defaultNotes;

  const msi = findArtifactPair(join(bundleDir, "msi"), parsed.version, ".msi");
  const nsis = findArtifactPair(
    join(bundleDir, "nsis"),
    parsed.version,
    "-setup.exe"
  );

  if (existsSync(outDir)) {
    rmSync(outDir, { recursive: true, force: true });
  }
  mkdirSync(outDir, { recursive: true });

  const stagedFiles = [
    msi.installerPath,
    msi.sigPath,
    nsis.installerPath,
    nsis.sigPath,
  ];
  for (const filePath of stagedFiles) {
    copyFileSync(filePath, join(outDir, basename(filePath)));
  }

  const manifest = buildUpdaterManifest({
    version: parsed.version,
    notes,
    pubDate: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    owner,
    repo,
    tag: parsed.tag,
    nsisFileName: basename(nsis.installerPath),
    nsisSignature: readFileSync(nsis.sigPath, "utf8").trim(),
    msiFileName: basename(msi.installerPath),
    msiSignature: readFileSync(msi.sigPath, "utf8").trim(),
  });

  const manifestErrors = validateUpdaterManifest(manifest, owner, repo);
  if (manifestErrors.length > 0) {
    throw new Error(
      `Generated manifest failed validation:\n- ${manifestErrors.join("\n- ")}`
    );
  }

  const manifestPath = join(outDir, parsed.manifestFileName);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const checksumTargets = [
    basename(msi.installerPath),
    basename(msi.sigPath),
    basename(nsis.installerPath),
    basename(nsis.sigPath),
    parsed.manifestFileName,
  ];
  const checksumLines = checksumTargets.map(
    (name) => `${sha256File(join(outDir, name))}  ${name}`
  );
  writeFileSync(
    join(outDir, "SHA256SUMS.txt"),
    `${checksumLines.join("\n")}\n`,
    "utf8"
  );

  console.log(
    `Staged ${checksumTargets.length + 1} release files in ${outDir} (manifest: ${parsed.manifestFileName}, channel: ${parsed.channel}).`
  );
}

main();
