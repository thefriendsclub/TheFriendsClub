import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const serverArgs = existsSync('.env') ? ['--env-file=.env', 'server/index.mjs'] : ['server/index.mjs'];
const children = [
  spawn(process.execPath, serverArgs, { stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit' })
];
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{children.forEach(child=>child.kill());process.exit(0);});
children.forEach(child=>child.on('exit',code=>{children.forEach(other=>{if(other!==child)other.kill();});process.exit(code||0);}));
