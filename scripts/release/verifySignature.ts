import { Buffer } from "node:buffer";
import { createHash, createPublicKey, verify } from "node:crypto";
import { readFileSync } from "node:fs";
import { parseMinisignTrustedComment } from "./releaseMetadata";

export interface VerifyMinisignInput {
  filePath: string;
  sigBase64: string;
  expectedFileName: string;
  expectedVersion: string;
  pubkeyBase64?: string;
}

/**
 * Verifies a Tauri minisign `.sig` payload against the artifact binary,
 * validating signed trusted-comment bindings (`file:` and `version:`) and,
 * when `pubkeyBase64` is supplied, verifying Ed25519 + keyId cryptographically.
 */
export function verifyMinisignArtifactSignature(
  input: VerifyMinisignInput
): void {
  const comment = parseMinisignTrustedComment(input.sigBase64);
  if (comment.file !== input.expectedFileName) {
    throw new Error(
      `Signature trusted comment file mismatch: expected "${input.expectedFileName}", got "${comment.file ?? "<missing>"}".`
    );
  }
  if (comment.version !== input.expectedVersion) {
    throw new Error(
      `Signature trusted comment version mismatch: expected "${input.expectedVersion}", got "${comment.version ?? "<missing>"}".`
    );
  }

  if (!input.pubkeyBase64) {
    return;
  }

  const outerSig = Buffer.from(input.sigBase64.trim(), "base64").toString("utf8");
  const sigLines = outerSig.trim().split(/\r?\n/);
  if (sigLines.length < 2) {
    throw new Error("Malformed minisign signature payload.");
  }

  const sigBin = Buffer.from(sigLines[1], "base64");
  if (sigBin.length !== 74) {
    throw new Error(`Unexpected minisign binary signature length: ${sigBin.length}`);
  }
  const sigAlg = sigBin.subarray(0, 2).toString("utf8");
  if (sigAlg !== "ED") {
    throw new Error(`Expected prehashed Ed25519 minisign signature ("ED"), got "${sigAlg}".`);
  }
  const sigKeyId = sigBin.subarray(2, 10);
  const sigBytes = sigBin.subarray(10, 74);

  const pubOuter = Buffer.from(input.pubkeyBase64.trim(), "base64").toString("utf8");
  const pubLines = pubOuter.trim().split(/\r?\n/);
  if (pubLines.length < 2 || !pubLines[0].startsWith("untrusted comment:")) {
    throw new Error("Invalid Tauri minisign public key.");
  }
  const pubBin = Buffer.from(pubLines[1], "base64");
  if (pubBin.length !== 42) {
    throw new Error(`Unexpected minisign public key binary length: ${pubBin.length}`);
  }
  const pubKeyId = pubBin.subarray(2, 10);
  if (!sigKeyId.equals(pubKeyId)) {
    throw new Error("Signature key ID does not match configured Tauri public key.");
  }

  const edPubBytes = pubBin.subarray(10, 42);
  const spkiPrefix = Buffer.from("302a300506032b6570032100", "hex");
  const publicKey = createPublicKey({
    key: Buffer.concat([spkiPrefix, edPubBytes]),
    format: "der",
    type: "spki",
  });

  const fileBytes = readFileSync(input.filePath);
  const digest = createHash("blake2b512").update(fileBytes).digest();
  const valid = verify(null, digest, publicKey, sigBytes);
  if (!valid) {
    throw new Error(
      `Ed25519 signature verification failed for ${input.expectedFileName}.`
    );
  }
}
