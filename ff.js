/* The Faith First Reset player. Shared helpers: storage, the three weeks of teaching, and the pieces
   that replace the Facebook group and the paper journal. Everything is saved on the phone under ff:*. */
const EMBED_OK=!/claude|anthropic/i.test(location.hostname) && location.protocol!=='file:';
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},
  del(k){try{localStorage.removeItem(k)}catch(e){}}
};
const uid=()=>Math.random().toString(36).slice(2,9);
const ymd=d=>{d=d instanceof Date?d:new Date(d);const z=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`};
const TODAY=ymd(new Date());
const WEEKDAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const WEEKDAYS_LONG=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
function fmtTime(t){if(!t)return '';const [h,m]=t.split(':').map(Number);const ap=h>=12?'pm':'am';return `${((h+11)%12)+1}${m?':'+String(m).padStart(2,'0'):''}${ap}`}
function nice(d){const x=new Date(d+'T12:00');return x.toLocaleDateString(undefined,{month:'short',day:'numeric'})}

/* ---- links Michelle gives out. Change them here and every page follows. ---- */
const LINKS={
  bibleApp:'https://www.bible.com/en/reading-plans/50214',   // YouVersion plan: Close in Prayer
  joel:'https://www.joelosteen.com/inspiration/todays-word',   // Joel Osteen, Today's Word
  playlist:'https://music.apple.com/us/playlist/worship-essentials/pl.06a94ac8b3fc41c2bef77143d70e63a8',   // Apple Music: Worship Essentials
  fervent:'https://www.amazon.com/s?k=fervent+priscilla+shirer',
  dailyGrace:'https://thedailygraceco.com/',
};
const VIDEOS={1:'pyyc_EZU278',2:'fhIiAxxv-xc',3:''};
/* chapters: [seconds, label]. Filled in once the recordings are transcribed. */
const CHAPTERS={
 1:[[180,'Settling in, the Bible app link'],[458,"Why I'm doing this"],[608,'The four things for today'],[683,'Opening prayer'],[740,'1. Let go of past attempts and guilt'],[859,'Shame loses its power when you speak it'],[1311,'A God of forgiveness. Intimacy with God'],[1404,'My friend of 20 years: closeness takes time'],[1536,'2. Reframe your quiet time'],[1585,'The meal-planning reframe'],[1724,'My 5am hour: the hot coffee, the nook'],[1978,"It doesn't have to be 5am: the midday reframe"],[2286,'The no-matter-what mentality'],[2467,'Start with 10 minutes. It grows'],[2579,'3. A recurring appointment with God'],[2672,'Put it in your calendar like any appointment'],[2950,'Alarms and notifications'],[3170,'4. How to fill the time: the warm-up'],[3283,'The Bible app devotions and "talk it over"'],[3372,'Doing a plan together: built-in accountability'],[3594,'A tip: breaking a verse down for your kid'],[3715,"Joel Osteen's daily devotion"],[3760,'Then the Word'],[3906,'Questions: finding Michelle on the Bible app'],[4093,'Wrap-up, and the group']],
 2:[[195,'Checking in: how week one went'],[344,'A season with a baby: routines and batching'],[517,'Today: prayer and worship'],[628,'Fervent, Priscilla Shirer, praying out loud'],[768,'Journaling your prayers as the warm-up'],[829,'Praise, repentance, ask'],[895,'My journal: a page per subject'],[1007,'Example: praying for your marriage'],[1144,'When you pray, open the journal and read it'],[1316,'Bookmark where you stop'],[1342,'"I\'ll pray for you": write it down'],[1419,'Make it stupid easy'],[1546,'Does this feel doable?'],[1776,'Praying with your kids on the way to school'],[1924,'They learn to pray out loud, then on their own'],[2047,'Worship'],[2143,'Worship in the background: kitchen, car, shower'],[2237,'The fruit, years later: Nico and worship'],[2446,'Keep going. They notice. Your spouse too'],[2590,'Next week: the Fab 4, confidence, comparison'],[2682,'Questions: praying on the way to preschool'],[2940,'Join the devotion and the group']],
 3:[]};

/* ---- the 21 days ---- */
const checkins=()=>store.get('ff:days',{});          // {ymd:{showed:true, parts:{devo:true,...}, note:''}}
const started=()=>store.get('ff:started','');
function dayNumber(){const n=Object.values(checkins()).filter(c=>c.showed).length;return Math.min(n+(checkins()[TODAY]&&checkins()[TODAY].showed?0:1),21)}
function daysDone(){return Object.values(checkins()).filter(c=>c.showed).length}
function streak(){let s=0,d=new Date();if(!(checkins()[TODAY]||{}).showed)d.setDate(d.getDate()-1);for(;;){const c=checkins()[ymd(d)];if(c&&c.showed){s++;d.setDate(d.getDate()-1)}else break;if(s>400)break}return s}
function setCheckin(d,c){const all=checkins();all[d]=c;store.set('ff:days',all);if(!started())store.set('ff:started',TODAY)}
function weekFor(day){return day<=7?1:day<=14?2:3}

/* ---- my quiet time (the appointment and what fills it) ---- */
const PARTS=[
  {id:'devo',name:'A devotion',small:'The Bible app plan we do together: Close in Prayer. 5 minutes.',link:'bibleApp',linkLabel:'Open the plan in the Bible app'},
  {id:'joel',name:"Joel's devotion",small:"Today's Word. A verse and a short word, every morning.",link:'joel',linkLabel:"Read today's word"},
  {id:'scripture',name:'Scripture',small:'The verses in the devotion count. Read them again, slowly.'},
  {id:'prayer',name:'Prayer',small:'Praise, repentance, ask. Use the journal to warm up.',href:'journal.html',linkLabel:'Open my prayer journal'},
  {id:'worship',name:'Worship',small:'One song, eyes closed, or on in the background while you move.',link:'playlist',linkLabel:"Michelle's playlist"},
  {id:'journal',name:'Write it down',small:'What spoke to you. One line is enough.'},
];
const appt=()=>({time:'',days:[0,1,2,3,4,5,6],place:'',drink:'',music:'',parts:['devo','joel','prayer'],...store.get('ff:appt',{})});
function setAppt(a){store.set('ff:appt',a)}

/* ---- prayer journal ---- */
const TOPICS_PRESET=['My marriage','My kids','My work','My dreams','My fears','My health'];
const topics=()=>store.get('ff:topics',[]);   // [{id,name,praise,repent,ask,updated}]
function setTopics(t){store.set('ff:topics',t)}
const people=()=>store.get('ff:people',[]);   // [{id,name,for,done,added}]
function setPeople(p){store.set('ff:people',p)}
const prayers=()=>store.get('ff:prayers',{}); // {ymd:'free text'}
function setPrayer(d,t){const p=prayers();if(t)p[d]=t;else delete p[d];store.set('ff:prayers',p)}

/* ---- worship moments ---- */
const MOMENTS=[['kitchen','Making breakfast, in the kitchen'],['car','In the car'],['shower','Shower, getting ready'],['work','While I work'],['kids','With the kids'],['bed','Falling asleep']];
const worship=()=>store.get('ff:worship',{});  // {ymd:{kitchen:true,...}}
function setWorship(d,m){const w=worship();w[d]=m;store.set('ff:worship',w)}

/* ---- week progress ---- */
const weeksDone=()=>store.get('ff:weeks',{});
function setWeekDone(n,v){const w=weeksDone();if(v)w[n]=TODAY;else delete w[n];store.set('ff:weeks',w)}

/* ---- the teaching. Each step is a card: heading, Michelle's words, maybe a tool (ws). ---- */
const WEEKS=[
 {n:1,title:'Showing up',sub:'Making time for God in real mom life. Letting go of guilt. Where to start.',
  steps:[
   {h:'So glad you\'re here',html:`<p>I've never done something like this, but it was in my heart. I work with so many women in health and fitness and I see so many of us struggling with our faith, with anxiety, worry, confidence, comparison.</p><p>I'm not a pastor or a minister (even though I did go to ministry school, fun fact). But I've done this wrong and I've done it right, and I've been consistent now for over 15 years, and that has carried me through a lot of hard things. I'm ready to share it with you and help you get into a better rhythm with God, because I know how crazy busy life is.</p><p>Four things this week: letting go of past attempts and the guilt around them, reframing your quiet time, a recurring appointment with God, and how to fill that time.</p>`},
   {h:'1. Let go of past attempts and guilt',html:`<p>It doesn't matter how many times you go to church a month, or how many times you started and stopped praying or having quiet time. What matters is your intention. Your heart. Your desire to grow.</p><p>Brené Brown says shame thrives in secrecy and grows in silence. When we speak it, it loses its power. I do this for everything. When I lose my cool with my kids and feel like a bad mom, like I failed God because I cursed, I could spiral. Instead I call a friend I trust, I say it out loud, she usually tells me something she did too, I realize I'm human, I apologize to my kids, and that's the end of it. No shame.</p><p>One more thing from Brené: our stories are not meant for everyone. Hearing them is a privilege. Use discernment about who has earned the right to hear yours.</p><p>Right now, let's make any shame you have around God lose its power. Write it here. Nobody sees it. When you're ready, release it.</p>`,ws:'release'},
   {h:'Our God is a God of forgiveness',html:`<p>All He desires is to be close to you. He wants to hear from you more often, and He wants you to rely on Him instead of social media or friends when you're down, scared, or going through something hard.</p><p>What we're after is <b>intimacy with God</b>, so that everything in your life gets easier, even the hardships. To trust Him when things get hard, you have to know Him. And you get to know someone by spending time with them. Me and my best friend Mindy are close because we spend time together. Same thing.</p>`},
   {h:'2. Reframe your quiet time',html:`<p>If it's been hard to be consistent, I think it's because of how you see that time. It can't be one more thing on the to-do list. You have to reframe it so you enjoy it and look forward to it, because then you'll be consistent.</p><p>Mine is 5am. Am I tired? Yes. Is it easy? No. But I've reframed it as my only quiet, uninterrupted coffee time. The one hour in the whole day I get to be still, drink a hot cup of coffee without reheating it, snuggled on the couch with a blanket, sometimes a candle. I love it. It sets me up for the day: peace, gratitude, a good mood. When I miss it, I feel the difference. If I stay up late for a show or dinner with a friend, I'm choosing to go to bed later, knowing I'm still getting up for my morning time.</p><p>It doesn't have to be the morning. Midday can be your cozy reset between shifts. Build a routine you love. A corner, a café, a comfy couch, a warm cup, worship music on. Make it a sacred time that soothes you.</p>`,ws:'reframe'},
   {h:'3. A recurring appointment with God',html:`<p>I've become a master of consistency only because I'm busy. Two kids, a business, a home, my health, God, all the things. For 25 years I taught clients that what you do on a recurring basis is what sticks. My 5am workouts. The no-matter-what mentality. I schedule everything else around the gym, not the other way around. I do it with content, with laundry, and we're going to do it with God.</p><p>Pick the time you can be <b>most consistent</b>, not the time that sounds nicest. Mine is Monday through Friday. Saturday is my day off and Sunday is church, and I don't feel guilty about it. Put it in your calendar like you would a doctor's appointment, and set the alarm. The alarm is me nagging you: you can't silence it until you sit down.</p>`,ws:'appt'},
   {h:'4. How to fill that time',html:`<p>I'm going to share what works for me, and you'll build a routine that's doable for you. It can change. Mine has changed a ton depending on the season (when I fast, it looks completely different). Right now we're testing. There is no failing here. If something doesn't work, switch it up.</p><p>The truth is, reading scripture is the hardest part, for me. So I start with devotions. They're easy to read and they always hit something.</p><p><b>The Bible app.</b> I do several devotion plans a day: one on my own about whatever I'm going through (parenting, stress, fear, business), one with my husband, one with my Fab 4. You can search by topic: marriage, hope, fear, healing, anger, patience, loss, doubt, new to faith. Each day is a short story-style reading, the scriptures that go with it, and a <b>talk it over</b> box where you type what you got out of it. Some days I go deep, some days one line. Doing a plan with other people is built-in accountability: nobody wants to be the last one to post.</p><p>If you have a little more time, a trick I started during our church fast: take the verse from the devotion and ask ChatGPT to explain it the way your 12-year-old would understand it, with an example from what they're going through. I've sent those to our family group chat. It breaks it down in a way that's good for me too.</p><p><b>Joel Osteen's devotion.</b> My favorite. Sign up on his site and it lands in your inbox every morning at 6. A verse, then his words. If you follow me on Instagram you've seen these on my stories.</p><p>Two devotions in, you've read three verses at least. If you want to go further, journal the scripture and read it again through the day. But if you stop here and you're consistent, you are doing really well. I started with 15 minutes. Then I enjoyed it so much I found 20, then 30, and now it's an hour. Start where you can be consistent.</p>`,ws:'parts'},
   {h:'This week',html:`<p>Show up at your appointment every day. Tick the day off on the home screen. If you miss one, no shame, just show up tomorrow. Next week: prayer and worship.</p>`},
  ]},
 {n:2,title:'Prayer and connection',sub:'How to pray when you don\'t know what to say. Worship as connection, not performance.',
  steps:[
   {h:'Checking in',html:`<p>Remember why you decided to do this: to grow in your faith, to put God first, to find more peace and joy, and less guilt. Look at your 21 days. Where are you? Whatever the answer, keep going.</p><p>Last week we reframed our time with God, set our appointment, and started filling it with devotions. This week, prayer and worship.</p>`},
   {h:'A structure for prayer',html:`<p>Aside from consistency, the thing I heard most was: I don't know what to say to God. How do I pray? Is it wrong to ask for too much?</p><p>I learned this from Priscilla Shirer's book <a href="${LINKS.fervent}" target="_blank" rel="noopener">Fervent</a>, the first book my Fab 4 read together. It changed my prayer life. She teaches praying out loud, because God hears our thoughts but the enemy doesn't. At 5am I was too tired to speak and think, so I hacked myself: I started <b>journaling</b> my prayers, the way I warm up with devotions before scripture.</p><p>Three parts:</p><p><b>Praise.</b> Gratitude for who God is and what He's already done.<br><b>Repentance.</b> Expose what I'm resisting, or just ask forgiveness for whatever comes to mind.<br><b>Ask.</b> What you want to lift up. Specific and personal. Other people's prayers go here too.</p><p>Do it by subject. In my journal I have a page for my marriage: what I'm grateful for in it, forgiveness for what I'm nudged about, and exactly what I'm asking for. Then my family, my work, my dreams, my passions, my fears. Some pages are constants I add to, some are seasonal. When it's time to pray, I start with the journal. It's my warm-up and it's how I don't forget what I wanted to bring to God. I don't get through everything every day, so I mark where I am and pick up there tomorrow.</p>`,ws:'journal'},
   {h:'"I\'ll pray for you"',html:`<p>I used to feel bad telling people I'd pray for them and then forgetting. Now it goes straight in the journal, and when I get to that page I pray for every one of them. Add them here.</p>`,ws:'people'},
   {h:'It won\'t always look like this',html:`<p>I'm not saying your prayer life has to be this way, or that it isn't a bit robotic. But when you're struggling with consistency, a structure gets you going. Once it's a habit, it evolves. Now a lot of mornings I pray in bed for a few minutes before I get up, and the nook is for devotions and scripture. Some days it's worship music on and a walk, and I pray during my cardio. But I plan for it. If I didn't get my prayers in bed, I tell myself, ok, today it's during cardio. If you don't plan it, it slips through the cracks. That's what happens to most of us.</p><p>With kids: bedtime prayers when they're little, on-the-way-to-school prayers when they're older. Then one day they do their own. Nico prays in the shower with worship on.</p>`},
   {h:'Worship',html:`<p>Worship is praise, and it's prayer. I do it many times a day. Pastors talk about using worship to sit in God's presence, eyes closed, resting in the music. I've tried, and honestly at 5am I fall asleep, and I'm not good at just sitting. So I worship all the time instead.</p><p>Mornings making breakfast. Any time I'm in the kitchen: "Hey Google, play worship." Always on in the car, and now my kids grab my phone and put it on themselves. The shower, getting ready. In the middle of a song I'll get in an extra chat with God.</p><p>Because of that, my kids love worship. Nico naps before games with worship on. His pump-up music is worship. When he's happy and grateful, worship. When they were little and had nightmares, I'd tell them to play worship and say the words of the song, and it worked every single time. Worship has always been my escape from anxiety, nerves and fear. I turn it on, focus on the words, and it fades.</p><p>Make it the background of your home. Your kids will see the peace it gives you and model it.</p>`,ws:'worship'},
   {h:'This week',html:`<p>Start the journal with one subject. Add your people. Pick one worship moment and make it a habit. There is no perfect routine, only the one that makes you feel most connected to Him and that you can keep. Next week: who you are, and who you do this with.</p>`},
  ]},
 {n:3,title:'Confidence, identity, and your people',sub:'Why comparison steals your confidence, where confidence actually comes from, and how to build your own Fab 4.',
  steps:[
   {h:'How was your week?',html:`<p>Did you start journaling your prayers? Have you been more intentional about worship? Look at your 21 days and your streak on the home screen. Then let's talk about confidence, and about not doing this alone.</p>`},
   {h:'Comparison',html:`<p>After working with over 200,000 women in person and online, the thing I see most is a lack of confidence, which turns into comparison, which becomes a vicious cycle.</p><p>It shows up scrolling social media and seeing everyone's highlight reel, and suddenly you feel like a failure, or you get angry at the post, or you criticize and condemn. It shows up with siblings and friends when someone's thriving in their marriage, their kids, their business, their finances, and it makes you feel not good enough. It shows up at work when someone else gets the promotion. Basically, anytime anyone around you is doing well and it makes you feel yucky. Less than. Threatened. Critical.</p>`,ws:'compare'},
   {h:'Where confidence comes from',html:`<p>To be confident no matter what, no matter if your friend has the bigger house, is in better shape, has the bags and the shoes, no matter if you're in a financial strain or your kids are struggling, <b>you have to be fully confident in who God created you to be.</b> You have to wholeheartedly believe He made you exactly the way you are, on purpose and for a purpose. That you have a God-given destiny, and no matter who has what around you, you are happy and proud of who you are and your life.</p><p>But to know your purpose, you have to know God. You need to spend time with Him, in His word, in devotions, in prayer, in worship, so you're constantly reminded how important you are to Him. That's why we spent two weeks on being consistent. When we know Him, we truly believe who we are. And then we have a confidence that won't be shaken, even when the marriage, the finances, the kids, the body are hard. Those are things happening to you. <b>They don't define you.</b></p><p>People ask me about my confidence. Some of it is how my parents raised me. But without my relationship with God and knowing who I am in His eyes, the hard times would have knocked me down. In my business, when others have more followers, more sales, more influence, it's easy to fall into comparison. I don't, because when I feel bad I go to Him, I go to the word, and I remember He knit me in my mother's womb.</p><p>So keep going. Your quiet time, your scripture, your prayer and devotion, so that when hard times come, and they will, you remember how special you are. So you can be genuinely happy for your friends. So you can scroll without criticizing, complaining or condemning, and without it touching your worth.</p>`,ws:'identity'},
   {h:'Scripture, simply',html:`<p>You don't need a study plan to read scripture. The verses inside your devotions count. Read them twice, slowly. Write the one that lands in the box above and read it again at lunch and before bed. When a plan ends, pick the next one by what you're walking through. That's the whole method, and it's how I've done it for 15 years.</p>`},
   {h:'Build your own Fab 4',html:`<p>If you follow me you've seen my Fab 4. Four of us who meet a few times a month to fellowship, do Bible and book studies, and help each other grow. We started nine years ago at a coffee shop, a Panera. We'd each invite a few women every time, and over time four of us stuck. We all wanted accountability, spiritual growth, fellowship.</p><p>We picked a book, read on our own, met to discuss a few chapters. Opened and closed in prayer, which is great practice for praying out loud. Took prayer requests. Set reading goals. Met in person twice a month, then added Zoom when the kids got busier. We've read countless Christian books and done so many studies, Daily Grace ones especially. We've served together, hosted worship nights in our homes, and we have plans for more in the community.</p><p><b>How to start.</b> Think of any friends who come to mind. Some a little ahead of you spiritually, some a little behind, so everyone grows and everyone serves. It doesn't have to be big. Start with two. Just ask. Just invite. Good girl time, venting, praying. A group of prayer warriors who help you grow and hold you accountable is priceless, and I wish it for every one of you.</p>`,ws:'fab4'},
   {h:'After the 21 days',html:`<p>Keep the appointment. Keep the journal. Keep worship on. Your routine can change with the season, so don't put pressure on yourself. Come back to any week whenever you need the reminder. I'm so proud of you for showing up.</p>`},
  ]},
];

/* ---- tools (worksheets) ---- */
function listEditor(el,opts){ // simple list of rows with fields
  const rows=store.get(opts.key,[]);
  const field=(r,f)=>f.type==='area'?`<textarea data-f="${f.k}" rows="2" placeholder="${esc(f.ph)}">${esc(r[f.k]||'')}</textarea>`
    :f.type==='check'?`<label class="chk"><input type="checkbox" data-f="${f.k}" ${r[f.k]?'checked':''}><span>${esc(f.ph)}</span></label>`
    :`<input type="${f.type||'text'}" data-f="${f.k}" placeholder="${esc(f.ph)}" value="${esc(r[f.k]||'')}">`;
  el.innerHTML=`<div class="rows">${rows.map((r,i)=>`<div class="row ${r.done?'done':''}" data-i="${i}"><div class="fields">${opts.fields.map(f=>field(r,f)).join('')}</div><button type="button" class="x" data-rm="1" aria-label="Remove">×</button></div>`).join('')||`<p class="note">${esc(opts.empty||'')}</p>`}</div><div class="toolrow"><button type="button" class="pill add" data-add="1">+ ${esc(opts.add)}</button></div>`;
  const save=()=>store.set(opts.key,rows);
  el.oninput=e=>{const row=e.target.closest('.row');if(!row)return;const r=rows[+row.dataset.i];const f=e.target.dataset.f;if(!f)return;r[f]=e.target.type==='checkbox'?e.target.checked:e.target.value;save();if(f==='done')row.classList.toggle('done',!!r.done)};
  el.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.add){rows.push(Object.fromEntries(opts.fields.map(f=>[f.k,f.type==='check'?false:''])));save();listEditor(el,opts);const l=el.querySelector('.row:last-of-type input[type=text],.row:last-of-type textarea');if(l)l.focus();return}
    if(b.dataset.rm){rows.splice(+b.closest('.row').dataset.i,1);save();listEditor(el,opts)}};
}
function bindObj(root,key,def){const o={...def,...store.get(key,{})};root.querySelectorAll('[data-k]').forEach(i=>{const k=i.dataset.k;if(i.type==='checkbox')i.checked=!!o[k];else i.value=o[k]??'';i.addEventListener('input',()=>{const cur={...def,...store.get(key,{})};cur[k]=i.type==='checkbox'?i.checked:i.value;store.set(key,cur)})});return o}

const HELP={
 release:{t:'How this works',html:`<p>Type whatever makes you feel shame about God, your faith, how long it's been, how many times you've started and stopped. Be honest. It is saved only on this phone until you tap <b>Release it</b>, and then it's gone for good. Saying it is what takes its power away. If you have a friend who has earned the right to hear it, tell her too.</p>`},
 reframe:{t:'What am I writing here?',html:`<p>Describe the version of your quiet time you'd look forward to. Where you'd sit, what's in your cup, what's playing, what's around you. Mine: the corner of my couch at 5am, a hot coffee I don't have to reheat, a blanket, sometimes a candle, worship on low. Make yours cozy enough that you want to get up for it.</p>`},
 appt:{t:'How to pick the time',html:`<p>Pick the time you can be <b>most consistent</b>, not the one that sounds nicest. Early morning survives the most interruptions. If that truly can't work, pick naptime, lunch, or right after drop-off, but pick it and protect it. Then set a repeating alarm in your phone's Clock app. The home screen will show your appointment every day.</p>`},
 parts:{t:'What goes in my quiet time?',html:`<p>Tick what you'll do, in order. Start smaller than you think: a devotion and a short prayer is a real quiet time. Add scripture, the journal and worship as the weeks go. Your daily check-in on the home screen shows exactly these, so you tick them off as you go. You can change this any time, and you should as the season changes.</p>`},
 journal:{t:'How to use the prayer journal',html:`<p>One page per subject. Under each: <b>Praise</b> (what I'm grateful for in this area), <b>Repentance</b> (what I'm resisting, where I need forgiveness), <b>Ask</b> (exactly what I want, specific and personal). Start with one subject, usually the one that's heaviest right now. Add the rest over the week. When you pray, open the journal and read it to God. Mark where you stop and pick up there tomorrow.</p>`},
 people:{t:'Who goes on this list?',html:`<p>Anyone you told "I'll pray for you." Their name and what it's for. When you get to this page during prayer, go down the list. Tick when the prayer is answered or the season passes, and it drops to the bottom.</p>`},
 worship:{t:'What are worship moments?',html:`<p>The ordinary moments of the day where worship can be on in the background: breakfast, the car, the shower, getting ready, falling asleep. Tick the ones that happened today. The point isn't a perfect score. It's noticing that worship can live in your whole day, not just your quiet time, and that your kids are watching.</p>`},
 compare:{t:'What am I looking for?',html:`<p>Where comparison shows up for you, honestly. The account you shouldn't follow. The friend whose news lands wrong. The room where you shrink. For each one, what it makes you feel (less than, angry, critical) and what you'll do the next time it happens: go to the word, go to Him, mute the account, pray for her by name.</p>`},
 identity:{t:'How to use this',html:`<p>Write the truth about who God says you are, in your own words, with the verse that proves it to you. Psalm 139 is where I go: He knit me together in my mother's womb, fearfully and wonderfully made. Then the one line you'll say to yourself the next time comparison hits. Come back and read this on the hard days. That's what it's for.</p>`},
 fab4:{t:'How to start a group',html:`<p>List every woman who comes to mind, even the long shots. Some a little ahead of you spiritually, some a little behind, so everyone grows and everyone serves. Two is enough to start. Pick a first book (Fervent is where we started), a first date, and a place, a coffee shop or a Zoom. Open and close in prayer, take prayer requests, set a few chapters for next time. Then just ask. Just invite.</p>`},
 days:{t:'How the 21 days work',html:`<p>Each day you show up at your appointment, tick <b>I showed up</b> and whatever you did. Day 1 is your first check-in, not a calendar date, so a missed day isn't a failed day. It just means tomorrow is still Day 9. Three weeks of teaching open as you go: Week 1 now, Week 2 after Day 7, Week 3 after Day 14. You can read ahead any time.</p>`},
 home:{t:'How the Faith First Reset works',html:`<p>21 days, 5 to 15 minutes a day, three weeks of teaching from Michelle. Week 1 is about showing up: letting go of guilt, reframing quiet time, setting a recurring appointment with God, and filling it with devotions. Week 2 is prayer and worship, with a prayer journal you keep here. Week 3 is confidence, identity and building your own Fab 4.</p><p>Every day: come here, see your appointment, tick off what you did. Everything you write stays on this phone. Nothing is graded. You cannot fail here.</p>`},
};
const helpHTML=k=>HELP[k]?`<details class="help"><summary>${esc(HELP[k].t)}</summary><div class="helpbody">${HELP[k].html}</div></details>`:'';

function renderWS(kind,el){
  el.classList.add('ws');el.innerHTML=helpHTML(kind);
  const box=document.createElement('div');box.className='ws';el.appendChild(box);el=box;
  switch(kind){
   case 'release':{
    const t=store.get('ff:release','');
    el.innerHTML=`<textarea id="rel" rows="5" placeholder="What makes me feel shame about my faith is…">${esc(t)}</textarea><div class="toolrow"><button type="button" class="go gold" id="relgo" style="padding:14px">Release it</button></div><p class="note" id="relmsg">${store.get('ff:released','')?'Released on '+nice(store.get('ff:released',''))+'. You can write and release again any time.':''}</p>`;
    el.oninput=e=>{if(e.target.id==='rel')store.set('ff:release',e.target.value)};
    el.onclick=e=>{if(e.target.id!=='relgo')return;store.del('ff:release');store.set('ff:released',TODAY);el.querySelector('#rel').value='';el.querySelector('#relmsg').textContent='Gone. It has no power here. He already forgave it.'};break}
   case 'reframe':
    el.innerHTML=`<label>My quiet time looks like<textarea data-k="scene" rows="4" placeholder="The corner of the couch, a hot coffee, a blanket, worship on low…"></textarea></label><div class="grid2"><label>Where<input type="text" data-k="place" placeholder="The couch, the patio, my car"></label><label>In my cup<input type="text" data-k="drink" placeholder="Coffee, tea"></label><label>Playing<input type="text" data-k="music" placeholder="Worship, quiet"></label></div>`;
    {const a=appt();bindObj(el,'ff:appt',a)}break;
   case 'appt':{
    const a=appt();
    el.innerHTML=`<label>My appointment with God<input type="time" data-k="time" style="max-width:150px"></label><p class="note">Days</p><div class="days big">${WEEKDAYS.map((d,i)=>`<button type="button" data-d="${i}" aria-pressed="${a.days.includes(i)}">${d}</button>`).join('')}</div><p class="note" id="apptmsg"></p>`;
    bindObj(el,'ff:appt',a);
    const msg=()=>{const b=appt();el.querySelector('#apptmsg').textContent=b.time?`${fmtTime(b.time)}, ${b.days.length===7?'every day':b.days.map(i=>WEEKDAYS[i]).join(', ')}. Now set it as a repeating alarm in your phone.`:'Pick a time you can keep.'};
    el.addEventListener('click',e=>{const b=e.target.closest('button[data-d]');if(!b)return;const x=appt();const d=+b.dataset.d;x.days=x.days.includes(d)?x.days.filter(y=>y!==d):[...x.days,d].sort();setAppt(x);b.setAttribute('aria-pressed',x.days.includes(d));msg()});
    el.addEventListener('input',msg);msg();break}
   case 'parts':{
    const a=appt();
    el.innerHTML=`<div class="ck">${PARTS.map(p=>`<label class="${a.parts.includes(p.id)?'on':''}"><input type="checkbox" data-p="${p.id}" ${a.parts.includes(p.id)?'checked':''}><span><b>${p.name}</b><small>${p.small}</small>${p.link&&LINKS[p.link]?`<a href="${LINKS[p.link]}" target="_blank" rel="noopener">${p.linkLabel} →</a>`:p.href?`<a href="${p.href}">${p.linkLabel} →</a>`:''}</span></label>`).join('')}</div>`;
    el.onchange=e=>{const i=e.target.closest('input[data-p]');if(!i)return;const x=appt();x.parts=i.checked?[...new Set([...x.parts,i.dataset.p])]:x.parts.filter(p=>p!==i.dataset.p);x.parts=PARTS.map(p=>p.id).filter(p=>x.parts.includes(p));setAppt(x);i.closest('label').classList.toggle('on',i.checked)};break}
   case 'journal':{
    let ts=topics();let cur=store.get('ff:topicTab',ts[0]&&ts[0].id);
    const draw=()=>{
      ts=topics();if(!ts.find(t=>t.id===cur))cur=ts[0]&&ts[0].id;
      const t=ts.find(t=>t.id===cur);
      el.innerHTML=`<div class="tabs">${ts.map(x=>`<button type="button" data-t="${x.id}" aria-pressed="${x.id===cur}">${esc(x.name)}</button>`).join('')}<button type="button" class="addtab" data-new="1">+ Subject</button></div>
        ${!ts.length?`<p class="note">Start with one subject.</p><div class="chips">${TOPICS_PRESET.map(n=>`<button type="button" class="chip" data-preset="${esc(n)}">${esc(n)}</button>`).join('')}</div>`:''}
        ${t?`<div class="pra"><label>Praise<small>What I'm grateful for in this</small><textarea data-k="praise" rows="3">${esc(t.praise||'')}</textarea></label><label>Repentance<small>What I'm resisting, where I need forgiveness</small><textarea data-k="repent" rows="3">${esc(t.repent||'')}</textarea></label><label>Ask<small>Specific and personal</small><textarea data-k="ask" rows="4">${esc(t.ask||'')}</textarea></label></div><div class="toolrow"><button type="button" class="pill" data-rename="1">Rename</button><button type="button" class="pill" data-del="1">Remove subject</button></div>`:''}`;
    };
    el.oninput=e=>{const k=e.target.dataset.k;if(!k)return;const all=topics();const t=all.find(t=>t.id===cur);if(!t)return;t[k]=e.target.value;t.updated=TODAY;setTopics(all)};
    el.onclick=e=>{const b=e.target.closest('button');if(!b)return;
      if(b.dataset.t){cur=b.dataset.t;store.set('ff:topicTab',cur);draw();return}
      if(b.dataset.preset||b.dataset.new){const name=b.dataset.preset||(el.querySelector('#newname')?'':null);
        if(b.dataset.new){const n=window.prompt?null:null;const box=document.createElement('div');box.className='toolrow';box.innerHTML=`<input type="text" id="newname" placeholder="Subject, e.g. My marriage" style="flex:1"><button type="button" class="pill add" data-save="1">Add</button>`;el.prepend(box);box.querySelector('input').focus();return}
        const all=topics();const id=uid();all.push({id,name,praise:'',repent:'',ask:''});setTopics(all);cur=id;store.set('ff:topicTab',cur);draw();return}
      if(b.dataset.save){const v=(el.querySelector('#newname').value||'').trim();if(!v)return;const all=topics();const id=uid();all.push({id,name:v,praise:'',repent:'',ask:''});setTopics(all);cur=id;store.set('ff:topicTab',cur);draw();return}
      if(b.dataset.rename){const all=topics();const t=all.find(t=>t.id===cur);const box=document.createElement('div');box.className='toolrow';box.innerHTML=`<input type="text" id="rename" value="${esc(t.name)}" style="flex:1"><button type="button" class="pill add" data-saverename="1">Save</button>`;b.closest('.toolrow').replaceWith(box);box.querySelector('input').focus();return}
      if(b.dataset.saverename){const v=(el.querySelector('#rename').value||'').trim();const all=topics();const t=all.find(t=>t.id===cur);if(v)t.name=v;setTopics(all);draw();return}
      if(b.dataset.del){const all=topics().filter(t=>t.id!==cur);setTopics(all);cur=all[0]&&all[0].id;draw()}};
    draw();break}
   case 'people':
    listEditor(el,{key:'ff:people',add:'Add someone',empty:'Nobody yet. The next time you say "I\'ll pray for you," put them here.',fields:[{k:'name',ph:'Who'},{k:'for',ph:'For what'},{k:'done',type:'check',ph:'Answered / done'}]});break;
   case 'worship':{
    const w={...worship()[TODAY]};
    el.innerHTML=`<p class="note">Today</p><div class="ck">${MOMENTS.map(([id,l])=>`<label class="${w[id]?'on':''}"><input type="checkbox" data-m="${id}" ${w[id]?'checked':''}><span>${l}</span></label>`).join('')}</div>${LINKS.playlist?`<a class="go quiet" href="${LINKS.playlist}" target="_blank" rel="noopener">▶ Michelle's worship playlist</a>`:''}`;
    el.onchange=e=>{const i=e.target.closest('input[data-m]');if(!i)return;w[i.dataset.m]=i.checked;setWorship(TODAY,w);i.closest('label').classList.toggle('on',i.checked)};break}
   case 'compare':
    listEditor(el,{key:'ff:compare',add:'Add one',empty:'Where does comparison show up for you?',fields:[{k:'where',ph:'Where it shows up, e.g. a certain account, a certain friend'},{k:'feel',ph:'What it makes me feel'},{k:'instead',type:'area',ph:'What I\'ll do next time'}]});break;
   case 'identity':
    el.innerHTML=`<label>Who God says I am<textarea data-k="who" rows="4" placeholder="Made on purpose, for a purpose…"></textarea></label><label>The verse I go to<input type="text" data-k="verse" placeholder="Psalm 139:13-14"></label><label>What I'll say to myself when comparison hits<input type="text" data-k="line" placeholder="This is happening to me. It doesn't define me."></label>`;
    bindObj(el,'ff:identity',{who:'',verse:'',line:''});break;
   case 'fab4':
    el.innerHTML=`<p class="note">Women I could invite</p><div id="invite"></div><div class="grid2" style="margin-top:8px"><label>First book or study<input type="text" data-k="book" placeholder="Fervent, a Daily Grace study…"></label><label>First meeting<input type="date" data-k="date"></label><label>Where<input type="text" data-k="where" placeholder="Coffee shop, my house, Zoom"></label><label>How often<input type="text" data-k="often" placeholder="Twice a month"></label></div><div class="ck" style="margin-top:8px"><label><input type="checkbox" data-k="asked"><span>I asked</span></label><label><input type="checkbox" data-k="met"><span>We met</span></label></div>`;
    listEditor(el.querySelector('#invite'),{key:'ff:invite',add:'Add a name',empty:'Even the long shots.',fields:[{k:'name',ph:'Name'},{k:'done',type:'check',ph:'Invited'}]});
    bindObj(el,'ff:fab4',{book:'',date:'',where:'',often:'',asked:false,met:false});break;
   default: el.innerHTML='';
  }
}
function vidHTML(id,title,chapters){
  if(!id)return '';
  const ch=(chapters||[]).length?`<div class="chaps">${chapters.map(([s,l])=>`<a href="https://www.youtube.com/watch?v=${id}&t=${s}s" target="_blank" rel="noopener"><span>${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}</span>${esc(l)}</a>`).join('')}</div>`:'';
  if(!EMBED_OK)return `<a class="go quiet" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">▶ ${esc(title||'Watch')}</a>${ch}`;
  return `<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1" title="${esc(title||'Video')}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>${ch}`;
}
if('serviceWorker' in navigator && location.protocol.startsWith('http')){navigator.serviceWorker.register('sw.js').catch(()=>{})}
