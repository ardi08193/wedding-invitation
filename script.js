(() => {
"use strict";
const c = window.WEDDING_CONFIG;
const $ = id => document.getElementById(id);
const fill = (id,value) => { $(id).textContent = value; };
const names = c.groom + " & " + c.bride;
fill("heroNames",names); fill("closingNames",names); fill("heroDate",c.dateLabel);
fill("groom",c.groom);fill("bride",c.bride);
fill("groomParents","Mr. "+c.groomFather+" & Mrs. "+c.groomMother);
fill("brideParents","Mr. "+c.brideFather+" & Mrs. "+c.brideMother);
fill("eventDate",c.dateLabel);fill("eventVenue",c.venue);fill("venueAddress",c.address);
fill("bankName",c.bankName);fill("bankAccount",c.bankAccount);fill("giftAddress",c.giftAddress);
const guest = new URLSearchParams(location.search).get("to");
if (guest) fill("guestName",guest.slice(0,100));
$("mapsLink").href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(c.address);
const eventStart = c.dateISO ? new Date(c.dateISO) : null;
const validDate = eventStart && !isNaN(eventStart.getTime());
const calendarDate = d => new Date(d.getTime()+7*3600000).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"");
if(validDate){
  const finish=new Date(eventStart.getTime()+c.durationMinutes*60000);
  const params=new URLSearchParams({action:"TEMPLATE",text:"The Wedding of "+names,dates:calendarDate(eventStart)+"/"+calendarDate(finish),ctz:"Asia/Jakarta",location:c.address,details:"We invite you to celebrate our wedding."});
  $("calendarLink").href="https://calendar.google.com/calendar/render?"+params;
} else { $("calendarLink").setAttribute("aria-disabled","true"); }
const pad=n=>String(n).padStart(2,"0");
function countdown(){
  if(!validDate)return;
  let d=Math.max(0,eventStart.getTime()-Date.now());
  fill("days",Math.floor(d/86400000));d%=86400000;
  fill("hours",pad(Math.floor(d/3600000)));d%=3600000;
  fill("minutes",pad(Math.floor(d/60000)));fill("seconds",pad(Math.floor((d%60000)/1000)));
} countdown();setInterval(countdown,1000);
$("attendance").addEventListener("change",()=>{
  const no=$("attendance").value==="Not Attending";
  $("guests").disabled=no;
});
function getJSONP(params){
  return new Promise((resolve,reject)=>{
    if(!c.scriptURL)return reject(new Error("Google Sheets not configured"));
    const cb="wcb_"+Math.random().toString(36).slice(2);
    const script=document.createElement("script");let settled=false;
    const done=(err,data)=>{
      if(settled)return;settled=true;clearTimeout(timer);delete window[cb];script.remove();
      err?reject(err):resolve(data);
    };
    const timer=setTimeout(()=>done(new Error("Timeout")),12000);
    window[cb]=data=>done(null,data);
    script.onerror=()=>done(new Error("Network error"));
    script.src=c.scriptURL+"?"+new URLSearchParams({...params,callback:cb});
    document.head.appendChild(script);
  });
}
async function loadWishes(){
 if(!c.scriptURL)return;
 try{
   const data=await getJSONP({action:"wishes"});
   if(!data.ok)throw Error("Wishes unavailable");
   const list=$("wishesList");list.replaceChildren();
   if(!data.wishes.length){list.textContent="Be the first to send a wish!";return}
   for(const entry of data.wishes){
     const div=document.createElement("div"),name=document.createElement("strong"),msg=document.createElement("p");
     div.className="wish";name.textContent=entry.name;msg.textContent=entry.message;
     div.append(name,msg);list.append(div);
   }
 }catch(_){$("wishesList").textContent="Wishes are temporarily unavailable."}
}
$("rsvpForm").addEventListener("submit",async e=>{
 e.preventDefault();const button=$("submitBtn");button.disabled=true;
 const status=$("status");status.textContent="Sending your RSVP...";
 try{
   if(!c.scriptURL)throw Error("Google Sheets is not configured");
   const id=crypto.randomUUID(),form=new FormData(e.currentTarget);
   form.set("id",id);
   form.set("guests",$("attendance").value==="Not Attending"?"0":$("guests").value);
   await fetch(c.scriptURL,{method:"POST",mode:"no-cors",body:new URLSearchParams(form)});
   let verified=false;
   for(let attempt=0;attempt<7;attempt++){
     await new Promise(r=>setTimeout(r,1800));
     try{const result=await getJSONP({action:"status",id});if(result.found){verified=true;break}}catch(_){}
   }
   if(!verified)throw Error("Could not verify submission");
   status.textContent="Thank you! Your RSVP has been recorded.";
   e.currentTarget.reset();$("guests").disabled=false;
   await loadWishes();
 }catch(_){status.textContent="RSVP could not be confirmed. Please contact the couple before submitting again."}
 finally{button.disabled=false}
});
async function copy(value,btn){
 try{await navigator.clipboard.writeText(value);btn.textContent="COPIED!"}
 catch(_){btn.textContent="COPY FAILED"}
}
$("copyBank").addEventListener("click",()=>copy(c.bankAccount,$("copyBank")));
$("copyAddress").addEventListener("click",()=>copy(c.giftAddress,$("copyAddress")));
$("musicButton").addEventListener("click",async()=>{
 const audio=$("bgMusic"),b=$("musicButton");
 if(audio.paused){try{await audio.play();b.textContent="Ⅱ";b.setAttribute("aria-pressed","true")}catch(_){b.title="Music file not available"}}
 else{audio.pause();b.textContent="♫";b.setAttribute("aria-pressed","false")}
});
if("IntersectionObserver" in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}}),{threshold:.08});
 document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
}else document.querySelectorAll(".reveal").forEach(el=>el.classList.add("visible"));
loadWishes();setInterval(loadWishes,20000);
})();