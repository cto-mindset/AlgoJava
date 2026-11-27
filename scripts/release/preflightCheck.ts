import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  isValidTauriPublicKey,
  parseReleaseTag,
  validateVersionAlignment,
} from "./releaseMetadata";

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }
  return undefined;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

interface PackageJsonShape {
  version: string;
}

interface TauriConfigShape {
  version: string;
  bundle?: {
    createUpdaterArtifacts?: boolean | string;
    windows?: {
      wix?: {
        version?: string;
      };
    };
  };
  plugins?: {
    updater?: {
      pubkey?: string;
      endpoints?: string[];
      requireSignedVersion?: boolean;
      dangerousInsecureTransportProtocol?: boolean;
      dangerousAcceptInvalidCerts?: boolean;
      dangerousAcceptInvalidHostnames?: boolean;
    };
  };
}

function extractCargoVersion(cargoToml: string): string {
  const match = /^\s*version\s*=\s*"([^"]+)"/m.exec(cargoToml);
  if (!match) {
    throw new Error("Unable to parse version from src-tauri/Cargo.toml.");
  }
  return match[1];
}

function main() {
  const tag = getArg("--tag");
  if (!tag) {
    throw new Error("Missing required argument: --tag <vX.Y.Z>");
  }

  const requireSigningKey = hasFlag("--require-signing-key");
  const expectedOwner = getArg("--owner") ?? "cto-mindset";
  const expectedRepo = getArg("--repo") ?? "algojava-releases";

  const pkg = JSON.parse(
    readFileSync(resolve("package.json"), "utf8")
  ) as PackageJsonShape;
  const tauriConf = JSON.parse(
    readFileSync(resolve("src-tauri/tauri.conf.json"), "utf8")
  ) as TauriConfigShape;
  const cargoVersion = extractCargoVersion(
    readFileSync(resolve("src-tauri/Cargo.toml"), "utf8")
  );

  const parsed = parseReleaseTag(tag);
  const errors: string[] = [];

  errors.push(
    ...validateVersionAlignment({
      tag,
      packageJsonVersion: pkg.version,
      tauriConfigVersion: tauriConf.version,
      cargoTomlVersion: cargoVersion,
      msiVersion: tauriConf.bundle?.windows?.wix?.version,
    })
  );

  if (tauriConf.bundle?.createUpdaterArtifacts !== true) {
    errors.push("tauri.conf.json: bundle.createUpdaterArtifacts must be true.");
  }

  const updater = tauriConf.plugins?.updater;
  if (!updater) {
    errors.push("tauri.conf.json: plugins.updater block is missing.");
  } else {
    if (updater.requireSignedVersion !== true) {
      errors.push("tauri.conf.json: plugins.updater.requireSignedVersion must be true.");
    }
    if (
      updater.dangerousInsecureTransportProtocol ||
      updater.dangerousAcceptInvalidCerts ||
      updater.dangerousAcceptInvalidHostnames
    ) {
      errors.push(
        "tauri.conf.json: TLS/HTTPS security bypass flags must never be enabled."
      );
    }

    const expectedStableEndpoint = `https://github.com/${expectedOwner}/${expectedRepo}/releases/latest/download/latest.json`;
    const endpoints = updater.endpoints ?? [];
    if (endpoints.length === 0) {
      errors.push("tauri.conf.json: plugins.updater.endpoints must not be empty.");
    }
    for (const url of endpoints) {
      if (!url.startsWith("https://")) {
        errors.push(`Updater endpoint must use HTTPS: ${url}`);
      }
    }
    if (!endpoints.includes(expectedStableEndpoint)) {
      errors.push(
        `tauri.conf.json: plugins.updater.endpoints must include ${expectedStableEndpoint}`
      );
    }

    const pubkey = updater.pubkey ?? "";
    if (requireSigningKey && !isValidTauriPublicKey(pubkey)) {
      errors.push(
        "tauri.conf.json: plugins.updater.pubkey must contain a valid generated Tauri minisign public key before building a signed release."
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Release preflight check failed for ${tag} (${parsed.channel}):\n- ${errors.join("\n- ")}`
    );
  }

  console.log(
    `Preflight OK: tag=${parsed.tag}, channel=${parsed.channel}, manifest=${parsed.manifestFileName}, msiVersion=${tauriConf.bundle?.windows?.wix?.version ?? parsed.version}`
  );
}

main();
