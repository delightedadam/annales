import { defineConfig } from 'vite';
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
export default defineConfig({base: process.env.PAGES_BASE ?? (repo && !repo.endsWith('.github.io') ? `/${repo}/` : '/'), build:{target:'es2022'}});
