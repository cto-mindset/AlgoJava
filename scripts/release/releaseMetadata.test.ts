import { describe, expect, it } from "vitest";
import {
  buildUpdaterManifest,
  parseReleaseTag,
  validateMsiVersion,
  validateUpdaterManifest,
  validateVersionAlignment,
} from "./releaseMetadata";

describe("Release metadata & updater manifest generation", () => {
  it("routes stable vs alpha/beta tags to separate manifests without breaking SemVer", () => {
    const stable = parseReleaseTag("v1.0.0");
    expect(stable).toEqual({
      tag: "v1.0.0",
      version: "1.0.0",
      major: 1,
      minor: 0,
      patch: 0,
      channel: "stable",
      isPrerelease: false,
      manifestFileName: "latest.json",
    });

    const alpha = parseReleaseTag("v1.0.0-alpha.1");
    expect(alpha.channel).toBe("alpha");
    expect(alpha.isPrerelease).toBe(true);
    expect(alpha.manifestFileName).toBe("latest-preview.json");

    const beta = parseReleaseTag("v1.0.0-beta.2");
    expect(beta.channel).toBe("beta");
    expect(beta.isPrerelease).toBe(true);
    expect(beta.manifestFileName).toBe("latest-preview.json");

    expect(() => parseReleaseTag("release-1.0.0")).toThrow();
  });

  it("validates version alignment and MSI numeric version bounds", () => {
    expect(validateMsiVersion("1.0.0.1")).toEqual([]);
    expect(validateMsiVersion("1.0.0-alpha.1").length).toBeGreaterThan(0);
    expect(validateMsiVersion("256.0.0.1").length).toBeGreaterThan(0);

    expect(
      validateVersionAlignment({
        tag: "v1.0.0-alpha.1",
        packageJsonVersion: "1.0.0-alpha.1",
        tauriConfigVersion: "1.0.0-alpha.1",
        cargoTomlVersion: "1.0.0-alpha.1",
        msiVersion: "1.0.0.1",
      })
    ).toEqual([]);

    expect(
      validateVersionAlignment({
        tag: "v1.0.0-alpha.1",
        packageJsonVersion: "1.0.0",
        tauriConfigVersion: "1.0.0-alpha.1",
        cargoTomlVersion: "1.0.0-alpha.1",
        msiVersion: "1.0.0.1",
      }).length
    ).toBeGreaterThan(0);

    expect(
      validateVersionAlignment({
        tag: "v1.1.0-alpha.1",
        packageJsonVersion: "1.1.0-alpha.1",
        tauriConfigVersion: "1.1.0-alpha.1",
        cargoTomlVersion: "1.1.0-alpha.1",
        msiVersion: "1.0.0.1",
      }).length
    ).toBeGreaterThan(0);

    expect(
      validateVersionAlignment({
        tag: "v1.0.0",
        packageJsonVersion: "1.0.0",
        tauriConfigVersion: "1.0.0",
        cargoTomlVersion: "1.0.0",
        msiVersion: "1.0.0.1",
      }).length
    ).toBeGreaterThan(0);
  });

  it("builds and validates Tauri 2 updater manifest with HTTPS URLs for MSI and NSIS", () => {
    const manifest = buildUpdaterManifest({
      version: "1.0.0",
      notes: "Production release",
      pubDate: "2026-11-27T00:00:00Z",
      owner: "cto-mindset",
      repo: "algojava-releases",
      tag: "v1.0.0",
      nsisFileName: "AlgoJava_1.0.0_x64-setup.exe",
      nsisSignature: "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZS1uc2lzLWFiY2RlZmdoaWprbG0=",
      msiFileName: "AlgoJava_1.0.0_x64_en-US.msi",
      msiSignature: "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZS1tc2ktYWJjZGVmZ2hpamtsbQ==",
    });

    expect(manifest.platforms["windows-x86_64-nsis"].url).toBe(
      "https://github.com/cto-mindset/algojava-releases/releases/download/v1.0.0/AlgoJava_1.0.0_x64-setup.exe"
    );
    expect(manifest.platforms["windows-x86_64-msi"].url).toBe(
      "https://github.com/cto-mindset/algojava-releases/releases/download/v1.0.0/AlgoJava_1.0.0_x64_en-US.msi"
    );
    expect(manifest.platforms["windows-x86_64"].url).toBe(
      manifest.platforms["windows-x86_64-nsis"].url
    );

    expect(
      validateUpdaterManifest(manifest, "cto-mindset", "algojava-releases")
    ).toEqual([]);

    const tampered = {
      ...manifest,
      platforms: {
        ...manifest.platforms,
        "windows-x86_64-msi": {
          signature: manifest.platforms["windows-x86_64-msi"].signature,
          url: "http://evil.example.com/AlgoJava.msi",
        },
      },
    };
    expect(
      validateUpdaterManifest(tampered, "cto-mindset", "algojava-releases").length
    ).toBeGreaterThan(0);

    const swapped = {
      ...manifest,
      platforms: {
        ...manifest.platforms,
        "windows-x86_64-msi": manifest.platforms["windows-x86_64-nsis"],
      },
    };
    expect(
      validateUpdaterManifest(swapped, "cto-mindset", "algojava-releases").length
    ).toBeGreaterThan(0);
  });
});
