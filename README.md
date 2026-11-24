# Faith First Reset

Michelle Marie's 21-day Faith First Reset as a phone app. The three weeks of teaching (the recorded calls
plus the same material written out), a daily check-in, the appointment with God, a prayer journal
(praise, repentance, ask), worship moments, and a Fab 4 starter. Everything is saved on the phone under `ff:*`.

Static site, no build. Open `start.html`.

- `ff.js` holds the links Michelle hands out (`LINKS`), the YouTube ids (`VIDEOS`), the chapter
  timestamps (`CHAPTERS`), the three weeks (`WEEKS`) and the tools (`renderWS`).
- `ff.css` is the shared look. `sw.js` caches for offline; bump `VERSION` when files change.
