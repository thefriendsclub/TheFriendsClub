import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../server/db.mjs';
import { createApp, createAdmin } from '../server/app.mjs';
const db=openDatabase(':memory:');
let server,base,cookie;
const request=async(path,method='GET',body,auth=false,headers={})=>{
 const res=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(auth?{Cookie:cookie}:{}),...headers},body:body?JSON.stringify(body):undefined});
 return {status:res.status,data:await res.json(),headers:res.headers};
};
before(async()=>{createAdmin(db,'admin@example.test','test-only-password-123');server=createApp(db).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base=`http://127.0.0.1:${server.address().port}/api`;});
after(()=>{server.close();db.close();});
test('private data and event mutations reject unauthenticated users',async()=>{
 for(const [path,method] of [['/admin/overview','GET'],['/admin/events','POST'],['/admin/applications/1','PATCH']])assert.equal((await request(path,method,method==='GET'?undefined:{})).status,401);
});
test('membership validation, duplicate prevention and stored readback',async()=>{
 assert.equal((await request('/applications','POST',{name:'Incomplete'})).status,400);
 const input={name:'Test Member',email:'member@example.test',phone:'+91 98765 43210',reason:'Meet new people.',consent:true};
 assert.equal((await request('/applications','POST',{...input,consent:false})).status,400);
 assert.equal((await request('/applications','POST',input)).status,201);
 assert.equal((await request('/applications','POST',input)).status,409);
 const stored=db.prepare('SELECT * FROM applications WHERE email=?').get(input.email);assert.equal(stored.reason,input.reason);assert.equal(stored.status,'pending');
});
test('login rejects incorrect credentials and issues an HttpOnly session',async()=>{
 assert.equal((await request('/admin/login','POST',{email:'admin@example.test',password:'wrong-password'})).status,401);
 const login=await request('/admin/login','POST',{email:'admin@example.test',password:'test-only-password-123'});
 assert.equal(login.status,200);assert.match(login.headers.get('set-cookie'),/HttpOnly/i);assert.match(login.headers.get('set-cookie'),/SameSite=Strict/i);cookie=login.headers.get('set-cookie').split(';')[0];
 assert.equal((await request('/admin/me','GET',undefined,true)).data.email,'admin@example.test');
});
test('admin can review applications and invalid status is rejected',async()=>{
 const overview=await request('/admin/overview','GET',undefined,true);assert.equal(overview.data.applications.length,1);
 const id=overview.data.applications[0].id;
 assert.equal((await request(`/admin/applications/${id}`,'PATCH',{status:'other'},true)).status,400);
 assert.equal((await request(`/admin/applications/${id}`,'PATCH',{status:'approved'},true)).status,200);
 assert.equal(db.prepare('SELECT status FROM applications WHERE id=?').get(id).status,'approved');
 assert.equal((await request('/admin/applications/999','PATCH',{status:'approved'},true)).status,404);
});
test('admin event create, update, public readback, delete and date validation',async()=>{
 const input={title:'Test picnic',date:'2027-01-20',time:'10:00 AM',location:'Park',description:'A friendly picnic.',image:'https://example.com/photo.jpg'};
 assert.equal((await request('/admin/events','POST',{...input,date:'2027-02-30'},true)).status,400);
 assert.equal((await request('/admin/events','POST',{...input,image:'javascript:alert(1)'},true)).status,400);
 const created=await request('/admin/events','POST',input,true);assert.equal(created.status,201);
 const id=created.data.id;
 assert.equal((await request(`/admin/events/${id}`,'PUT',{...input,title:'Updated picnic'},true)).status,200);
 assert.ok((await request('/events')).data.some(e=>e.id===id&&e.title==='Updated picnic'));
 assert.equal((await request(`/admin/events/${id}`,'DELETE',undefined,true)).status,200);
 assert.ok(!(await request('/events')).data.some(e=>e.id===id));
});
test('newsletter validates and deduplicates email addresses',async()=>{
 assert.equal((await request('/newsletter','POST',{email:'invalid'})).status,400);
 for(let i=0;i<2;i++)assert.equal((await request('/newsletter','POST',{email:'subscriber@example.test'})).status,201);
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM subscribers').get().n,1);
});
test('cross-origin mutations are rejected',async()=>{assert.equal((await request('/admin/events','POST',{},true,{Origin:'https://untrusted.example'})).status,403);});
test('logout invalidates the stored session',async()=>{assert.equal((await request('/admin/logout','POST',{},true)).status,200);assert.equal((await request('/admin/me','GET',undefined,true)).status,401);});
