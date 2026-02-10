import { readFile, writeFile } from 'node:fs/promises';

type CliOptions = {
  version?: string;
  tag?: string;
  dryRun: boolean;
  write: boolean;
};

const SEMVER_REGEX = /^[0-9]+\.[0-9]+\.[0-9]+([-.].+)?$/;

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
    write: false,
  };

  for (let index = 2; index < argv.length; index++) {
    const arg = argv[index];

    if (arg === '--dry-run' || arg === '--dry') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--write') {
      options.write = true;
      continue;
    }

    if (arg === '--version') {
      const value = argv[++index];
      if (!value) throw new Error('--version requires a value');
      options.version = value;
      continue;
    }

    if (arg === '--tag') {
      const value = argv[++index];
      if (!value) throw new Error('--tag requires a value');
      options.tag = value;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  // Intentionally concise; shown in CI logs.
  // eslint-disable-next-line no-console
  console.log(`Usage:
  bun scripts/bump-version.ts --version <semver> [--dry-run | --write]
  bun scripts/bump-version.ts --tag <vX.Y.Z> [--dry-run | --write]

Options:
  --version   Version to set (e.g., 1.2.3)
  --tag       Tag to derive version from (e.g., v1.2.3)
  --dry-run   Print what would change, do not write
  --write     Write changes to disk
`);
}

function normalizeVersion(options: CliOptions): string {
  const provided = options.version ?? (options.tag ? options.tag.replace(/^v/, '') : undefined);

  if (!provided) {
    throw new Error('Provide --version <semver> or --tag <vX.Y.Z>');
  }

  if (!SEMVER_REGEX.test(provided)) {
    throw new Error(`Invalid semver version: ${provided}`);
  }

  return provided;
}

async function readJsonFile<T>(path: string): Promise<T> {
  const raw = await readFile(path, 'utf8');
  return JSON.parse(raw) as T;
}

async function writeJsonFile(path: string, value: unknown) {
  const pretty = JSON.stringify(value, null, 2) + '\n';
  await writeFile(path, pretty, 'utf8');
}

function updatePackageJson(packageJson: any, version: string): { before: string; after: string } {
  const before = String(packageJson?.version ?? '');
  packageJson.version = version;
  const after = String(packageJson.version);
  return { before, after };
}

function updateServerJson(
  serverJson: any,
  version: string
): { before: string; after: string; updatedPackages: number } {
  const before = String(serverJson?.version ?? '');
  serverJson.version = version;

  let updatedPackages = 0;
  if (Array.isArray(serverJson.packages)) {
    for (const pkg of serverJson.packages) {
      if (pkg && pkg.registryType === 'npm') {
        pkg.version = version;
        updatedPackages++;
      }
    }
  }

  const after = String(serverJson.version);
  return { before, after, updatedPackages };
}

const options = parseArgs(process.argv);
const version = normalizeVersion(options);

if (options.dryRun && options.write) {
  throw new Error('Choose either --dry-run or --write (not both)');
}

const mode = options.write ? 'write' : 'dry-run';

// eslint-disable-next-line no-console
console.log(`[bump-version] mode=${mode} version=${version}`);

const packageJsonPath = 'package.json';
const serverJsonPath = 'server.json';

const packageJson = await readJsonFile<any>(packageJsonPath);
const serverJson = await readJsonFile<any>(serverJsonPath);

const pkgChange = updatePackageJson(packageJson, version);
const serverChange = updateServerJson(serverJson, version);

// eslint-disable-next-line no-console
console.log(`[bump-version] ${packageJsonPath}: ${pkgChange.before} -> ${pkgChange.after}`);
// eslint-disable-next-line no-console
console.log(
  `[bump-version] ${serverJsonPath}: ${serverChange.before} -> ${serverChange.after} (updated npm packages: ${serverChange.updatedPackages})`
);

if (options.write) {
  await writeJsonFile(packageJsonPath, packageJson);
  await writeJsonFile(serverJsonPath, serverJson);
  // eslint-disable-next-line no-console
  console.log('[bump-version] wrote changes');
} else {
  // eslint-disable-next-line no-console
  console.log('[bump-version] dry-run only (no files written)');
}
