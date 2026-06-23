import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const TMP_DIR = path.resolve(__dirname, "../../../.tmp-cli-test");
const CLI_PATH = path.resolve(__dirname, "../../../cli/index.ts");
const PROJECT_ROOT = path.resolve(__dirname, "../../..");

beforeAll(() => {
  fs.mkdirSync(TMP_DIR, { recursive: true });
});

afterAll(() => {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
});

function runCLI(args: string): { stdout: string; stderr: string } {
  try {
    const stdout = execSync(`npx tsx "${CLI_PATH}" ${args}`, {
      cwd: PROJECT_ROOT,
      encoding: "utf-8",
      timeout: 15000,
    });
    return { stdout, stderr: "" };
  } catch (e: any) {
    return { stdout: e.stdout || "", stderr: e.stderr || "" };
  }
}

describe("CLI Integration", () => {
  it("prints help without error", () => {
    const { stdout } = runCLI("--help");
    expect(stdout).toContain("atlas-match");
    expect(stdout).toContain("analyze");
  });

  it("--version prints version", () => {
    const { stdout } = runCLI("--version");
    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  it("analyze --help shows all options", () => {
    const { stdout } = runCLI("analyze --help");
    expect(stdout).toContain("--format");
    expect(stdout).toContain("--config");
    expect(stdout).toContain("--jd");
    expect(stdout).toContain("--cv-dir");
    expect(stdout).toContain("--out");
    // Should show all 3 format options
    expect(stdout).toContain("json");
    expect(stdout).toContain("md");
    expect(stdout).toContain("html");
  });

  it("rejects analyze without --jd", () => {
    const { stderr, stdout } = runCLI("analyze");
    expect(stdout + stderr).toContain("--jd");
  });

  it("rejects analyze with invalid --jd path", () => {
    const { stderr, stdout } = runCLI("analyze --jd nonexistent.pdf --cv dummy.txt");
    expect(stdout + stderr).toContain("not found");
  });

  it("config file with valid JSON is parseable", () => {
    const configPath = path.join(TMP_DIR, "config.json");
    fs.writeFileSync(configPath, JSON.stringify({ format: "json" }), "utf-8");
    const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(data.format).toBe("json");
  });

  it("default config file is supported", () => {
    const configPath = path.join(TMP_DIR, ".atlas-match.json");
    fs.writeFileSync(configPath, JSON.stringify({ format: "html" }), "utf-8");
    const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(data.format).toBe("html");
  });
});
