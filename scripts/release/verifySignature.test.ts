import { Buffer } from "node:buffer";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { verifyMinisignArtifactSignature } from "./verifySignature";

describe("Minisign Ed25519 artifact signature verifier", () => {
  it("verifies valid signatures and rejects tampering, file swap, and version mismatch", () => {
    const dir = mkdtempSync(join(tmpdir(), "algojava-sig-test-"));
    try {
      const artifactName = "AlgoJava_1.0.0_x64-setup.exe";
      const artifactPath = join(dir, artifactName);
      const payload = Buffer.from("AlgoJava installer binary payload");
      writeFileSync(artifactPath, payload);

      const { publicKey, privateKey } = generateKeyPairSync("ed25519");
      const spki = publicKey.export({ format: "der", type: "spki" });
      const rawEdPub = spki.subarray(spki.length - 32);
      const keyId = Buffer.from("0102030405060708", "hex");

      const pubBin = Buffer.concat([Buffer.from("Ed", "utf8"), keyId, rawEdPub]);
      const pubText = `untrusted comment: minisign test pubkey\n${pubBin.toString("base64")}\n`;
      const pubkeyBase64 = Buffer.from(pubText, "utf8").toString("base64");

      const digest = createHash("blake2b512").update(payload).digest();
      const rawSig = sign(null, digest, privateKey);
      const sigBin = Buffer.concat([Buffer.from("ED", "utf8"), keyId, rawSig]);
      const trustedComment = `timestamp:1700000000\tfile:${artifactName}\tversion:1.0.0`;
      const sigText = `untrusted comment: signature from test\n${sigBin.toString("base64")}\ntrusted comment: ${trustedComment}\ndummyglobalsig\n`;
      const sigBase64 = Buffer.from(sigText, "utf8").toString("base64");

      expect(() =>
        verifyMinisignArtifactSignature({
          filePath: artifactPath,
          sigBase64,
          expectedFileName: artifactName,
          expectedVersion: "1.0.0",
          pubkeyBase64,
        })
      ).not.toThrow();

      expect(() =>
        verifyMinisignArtifactSignature({
          filePath: artifactPath,
          sigBase64,
          expectedFileName: artifactName,
          expectedVersion: "1.0.1",
          pubkeyBase64,
        })
      ).toThrow(/version mismatch/i);

      expect(() =>
        verifyMinisignArtifactSignature({
          filePath: artifactPath,
          sigBase64,
          expectedFileName: "AlgoJava_1.0.0_x64_en-US.msi",
          expectedVersion: "1.0.0",
          pubkeyBase64,
        })
      ).toThrow(/file mismatch/i);

      const tampered = Buffer.from(payload);
      tampered[0] ^= 0xff;
      writeFileSync(artifactPath, tampered);
      expect(() =>
        verifyMinisignArtifactSignature({
          filePath: artifactPath,
          sigBase64,
          expectedFileName: artifactName,
          expectedVersion: "1.0.0",
          pubkeyBase64,
        })
      ).toThrow(/Ed25519 signature verification failed/i);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
