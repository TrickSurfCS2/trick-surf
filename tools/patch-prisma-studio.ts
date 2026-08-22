import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function findFiles(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...findFiles(fullPath, pattern));
      } else if (pattern.test(fullPath)) {
        results.push(fullPath);
      }
    }
  } catch {
    // Ignore inaccessible directories
  }
  return results;
}

// 1. Patch studio.js inside prisma/build
const studioFiles = findFiles('node_modules', /prisma[/\\]build[/\\]studio\.js$/);
for (const filePath of studioFiles) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    if (content.includes('{columns:p,name:w,schema:v}=c,x=p.sort(')) {
      content = content.replace(
        '{columns:p,name:w,schema:v}=c,x=p.sort(',
        '{columns:p_raw,name:w,schema:v}=c,p=(Array.isArray(p_raw)?p_raw:(typeof p_raw==="string"?JSON.parse(p_raw):[])),x=p.sort('
      );
      writeFileSync(filePath, content, 'utf-8');
      console.log(`[patch-prisma-studio] Successfully patched ${filePath}`);
    }
  } catch {
    // Ignore errors
  }
}

// 2. Patch @prisma/studio-core
const coreFiles = findFiles('node_modules', /@prisma[/\\]studio-core[/\\]dist[/\\]data[/\\]mysql-core[/\\]index\.(js|cjs)$/);
for (const filePath of coreFiles) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let patched = false;

    // Pattern for ES module (.js)
    if (content.includes('{columns:h,name:R,schema:a}=c,l=h.sort(')) {
      content = content.replace(
        '{columns:h,name:R,schema:a}=c,l=h.sort(',
        '{columns:h_raw,name:R,schema:a}=c,h=(Array.isArray(h_raw)?h_raw:(typeof h_raw==="string"?JSON.parse(h_raw):[])),l=h.sort('
      );
      patched = true;
    }

    // Pattern for CommonJS (.cjs)
    if (content.includes('{columns:d,name:l,schema:u}=s,f=d.sort(')) {
      content = content.replace(
        '{columns:d,name:l,schema:u}=s,f=d.sort(',
        '{columns:d_raw,name:l,schema:u}=s,d=(Array.isArray(d_raw)?d_raw:(typeof d_raw==="string"?JSON.parse(d_raw):[])),f=d.sort('
      );
      patched = true;
    }

    if (patched) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`[patch-prisma-studio] Successfully patched ${filePath}`);
    }
  } catch {
    // Ignore errors
  }
}
