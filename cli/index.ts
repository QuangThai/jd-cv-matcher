import "dotenv/config";
import fs from "fs";
import path from "path";
import { Command } from "commander";
import { extractTextFromFile } from "@/lib/files/extract-text";
import { normalizeText } from "@/lib/files/normalize-text";
import { extractJD } from "@/lib/llm/extract-jd";
import { extractCV } from "@/lib/llm/extract-cv";
import { matchCandidate, buildReport } from "@/lib/llm/match-candidate";
import { generateHtmlReport, generateMarkdownReport } from "@/lib/cli/html-report";
import type { MatchReport } from "@/lib/types/match";

const program = new Command();

program
  .name("atlas-match")
  .description("Evidence-first JD & CV matching tool")
  .version("0.1.0");

type CliOptions = {
  jd?: string;
  cv?: string;
  cvDir?: string;
  out?: string;
  format?: string;
  config?: string;
};

program
  .command("analyze")
  .description("Analyze a JD against one or more CVs")
  .option("--jd <path>", "Path to Job Description file (PDF, DOCX, TXT)")
  .option("--cv <path>", "Path to a single CV file")
  .option("--cv-dir <path>", "Path to directory containing CV files")
  .option("--out <path>", "Output file path")
  .option("--format <format>", "Output format: json, md, or html", "md")
  .option("--config <path>", "Path to config file (.json)")
  .action(async (options: CliOptions) => {
    try {
      // Load config file if provided
      if (options.config) {
        const configPath = path.resolve(options.config!);
        if (!fs.existsSync(configPath)) {
          console.error(`Error: Config file not found: ${configPath}`);
          process.exit(1);
        }
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        // Merge: CLI options take precedence over config file
        options = { ...config, ...options };
      }

      // Default config lookup
      if (!options.config) {
        for (const name of [".atlas-match.json", "atlas-match.config.json"]) {
          const cfgPath = path.resolve(process.cwd(), name);
          if (fs.existsSync(cfgPath)) {
            const config = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
            options = { ...config, ...options };
            break;
          }
        }
      }

      if (!options.jd) {
        console.error("Error: Provide --jd <path> or set 'jd' in config file");
        process.exit(1);
      }
      if (!options.cv && !options.cvDir) {
        console.error("Error: Provide --cv, --cv-dir, or set 'cv'/'cvDir' in config file");
        process.exit(1);
      }

      if (!fs.existsSync(options.jd)) {
        console.error(`Error: JD file not found: ${options.jd}`);
        process.exit(1);
      }

      // Collect CV files
      let cvFiles: string[] = [];
      if (options.cv) {
        if (!fs.existsSync(options.cv!)) {
          console.error(`Error: CV file not found: ${options.cv}`);
          process.exit(1);
        }
        cvFiles.push(options.cv!);
      }
      if (options.cvDir) {
        if (!fs.existsSync(options.cvDir)) {
          console.error(`Error: CV directory not found: ${options.cvDir}`);
          process.exit(1);
        }
        const files = fs.readdirSync(options.cvDir);
        cvFiles.push(
          ...files
            .filter((f) => f.endsWith(".pdf") || f.endsWith(".docx") || f.endsWith(".txt"))
            .map((f) => path.join(options.cvDir!, f))
        );
      }

      if (cvFiles.length === 0) {
        console.error("Error: No valid CV files found (supported: PDF, DOCX, TXT)");
        process.exit(1);
      }

      const format = options.format || "md";

      console.log(`\n🔍 Atlas Match — Evidence-first candidate screening\n`);
      console.log(`📄 JD: ${path.basename(options.jd!)}`);
      console.log(`👥 CVs: ${cvFiles.length} file(s)`);
      console.log(`📋 Format: ${format.toUpperCase()}\n`);

      // Step 1: Extract JD text
      console.log("⏳ Extracting JD text...");
      const jdExtracted = await extractTextFromFile(options.jd!);
      const jdText = normalizeText(jdExtracted.text);
      console.log(`   ✓ ${jdExtracted.metadata.wordCount} words extracted`);

      // Step 2: Extract CV texts with progress
      console.log("⏳ Extracting CV texts...");
      const cvTexts = await Promise.all(
        cvFiles.map(async (cvFile) => {
          const extracted = await extractTextFromFile(cvFile);
          return {
            fileName: path.basename(cvFile),
            text: normalizeText(extracted.text),
            metadata: extracted.metadata,
          };
        })
      );
      cvTexts.forEach((cv) => console.log(`   ✓ ${cv.fileName}: ${cv.metadata.wordCount} words`));

      // Step 3: LLM extraction
      console.log("\n⏳ Extracting JD structure (OpenAI)...");
      const jd = await extractJD(jdText);
      console.log(`   ✓ ${jd.requiredSkills.length} required, ${jd.preferredSkills.length} preferred skills`);

      console.log("⏳ Extracting CV structures (OpenAI)...");
      const cvExtracts = await Promise.all(
        cvTexts.map(async (cv) => {
          const extracted = await extractCV(cv.text);
          return extracted;
        })
      );
      cvExtracts.forEach((cv, i) =>
        console.log(`   ✓ ${cv.candidateName || `CV ${i + 1}`}: ${cv.skills.length} skills`)
      );

      // Step 5: Match
      console.log("\n⏳ Matching candidates...");
      const results = await Promise.all(cvExtracts.map((cv, i) => matchCandidate(jd, cv, i)));

      // Step 6: Build report
      console.log("⏳ Building report...");
      const report = buildReport(jd, cvExtracts, results);

      // Step 7: Output
      const outputPath = options.out;

      if (format === "json") {
        const jsonOutput = JSON.stringify(
          { analysisId: `analysis-${Date.now()}`, report },
          null,
          2
        );
        if (outputPath) {
          fs.writeFileSync(outputPath, jsonOutput, "utf-8");
          console.log(`\n✅ JSON report saved: ${outputPath}`);
        } else {
          console.log("\n" + jsonOutput);
        }
      } else if (format === "html") {
        const htmlOutput = generateHtmlReport(report);
        const outFile = outputPath || `atlas-report-${Date.now()}.html`;
        fs.writeFileSync(outFile, htmlOutput, "utf-8");
        console.log(`\n✅ HTML report saved: ${outFile}`);
      } else {
        const mdOutput = generateMarkdownReport(report);
        if (outputPath) {
          fs.writeFileSync(outputPath, mdOutput, "utf-8");
          console.log(`\n✅ Markdown report saved: ${outputPath}`);
        } else {
          console.log("\n" + mdOutput);
        }
      }

      console.log("\n✨ Analysis complete!\n");
    } catch (error) {
      console.error("\n❌ Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });


program.parse(process.argv);
