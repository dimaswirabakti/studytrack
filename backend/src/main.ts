import app from "./app.js";
import { env } from "./config.js";

// entrypoint untuk development lokal, di vercel app dijalankan sebagai function
app.listen(env.PORT, () => {
  console.log(`StudyTrack backend berjalan di http://localhost:${env.PORT}`);
});
