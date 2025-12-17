import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { mdToPdf } from "md-to-pdf";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const stylesheet = [path.join(repoRoot, "policy", "pdf.css")];

const pdfOptions = {
  format: "A4",
  printBackground: true,
  margin: {
    top: "20mm",
    right: "18mm",
    bottom: "20mm",
    left: "18mm",
  },
};

const jobs = [
  {
    input: path.join(repoRoot, "policy", "cookie-policy.md"),
    output: path.join(repoRoot, "public", "cookie-policy.pdf"),
  },
  {
    input: path.join(repoRoot, "policy", "privacy-policy.md"),
    output: path.join(repoRoot, "public", "privacy-policy.pdf"),
  },
  {
    input: path.join(repoRoot, "policy", "terms-of-use.md"),
    output: path.join(repoRoot, "public", "terms-of-use.pdf"),
  },
];

async function main() {
  // Ensure output directory exists
  await fs.mkdir(path.join(repoRoot, "public"), { recursive: true });

  for (const job of jobs) {
    const result = await mdToPdf(
      { path: job.input },
      {
        stylesheet,
        pdf_options: pdfOptions,
      }
    );

    if (!result?.content) {
      throw new Error(`Failed to generate PDF for ${job.input}`);
    }

    await fs.writeFile(job.output, result.content);
    // eslint-disable-next-line no-console
    console.log(`Wrote ${path.relative(repoRoot, job.output)}`);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


