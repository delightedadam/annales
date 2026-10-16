import {defineConfig} from '@playwright/test';
const repo=process.env.GITHUB_REPOSITORY?.split('/')[1];
const base=process.env.PAGES_BASE??(repo&&!repo.endsWith('.github.io')?`/${repo}/`:'/');
export default defineConfig({testDir:'./e2e',use:{baseURL:`http://127.0.0.1:4182${base}`,headless:true},webServer:{command:'node node_modules/vite/bin/vite.js preview --host 0.0.0.0 --port 4182',url:`http://127.0.0.1:4182${base}`,reuseExistingServer:!process.env.CI},projects:[{name:'desktop',use:{viewport:{width:1280,height:900}}},{name:'mobile',use:{viewport:{width:390,height:844},isMobile:true}}]});
