import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/mobile',testMatch:'maraton.spec.ts',workers:1,timeout:60000,
  use:{baseURL:'http://127.0.0.1:4173',viewport:{width:390,height:844},hasTouch:true,isMobile:true,launchOptions:{channel:'chrome'},trace:'retain-on-failure'},
  webServer:[
    {command:'node scripts/test-maraton-server.mjs',port:8787,reuseExistingServer:false},
    {command:'npm run preview -- --host 127.0.0.1',port:4173,reuseExistingServer:false},
  ],
});
