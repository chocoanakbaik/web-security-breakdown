"use strict";
const express=require("express"),helmet=require("helmet"),fs=require("node:fs"),path=require("node:path");
const app=express(),HOST="127.0.0.1",PORT=Number(process.env.PORT||4317),LOG=path.join(__dirname,"lab_events.jsonl");
app.disable("x-powered-by");app.use(helmet());app.use(express.json({limit:"8kb",strict:true}));
function clean(v,n=120){return typeof v==="string"?v.replace(/[\r\n\0]/g," ").slice(0,n):"";}
app.get("/health",(_q,s)=>s.json({ok:true,storesTokens:false}));
app.get("/log-sink",(_q,s)=>s.status(405).json({error:"POST synthetic event metadata only; logs are not exposed"}));
app.post("/log-sink",(q,s)=>{const b=q.body;if(!b||typeof b!=="object"||Array.isArray(b))return s.status(400).json({error:"Expected JSON object"});if(["token","accessToken","authorization","cookie"].some(k=>Object.prototype.hasOwnProperty.call(b,k)))return s.status(400).json({error:"Credential-like fields are prohibited"});const e={timestamp:new Date().toISOString(),type:clean(b.type,80)||"UNSPECIFIED_DEMO_EVENT",marker:clean(b.marker,80)||"SYNTHETIC_ONLY",note:clean(b.note,180)};fs.appendFileSync(LOG,JSON.stringify(e)+"\n",{encoding:"utf8",mode:0o600});console.log("\n[LAB EVENT RECORDED]\n"+JSON.stringify(e,null,2));s.status(201).json({ok:true,stored:true,event:e});});
app.listen(PORT,HOST,()=>console.log("Synthetic event sink at http://"+HOST+":"+PORT+"; credential fields rejected."));