const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const http = require('http');
const express = require('express');
const fetch = require('node-fetch');
const qs = require('querystring');
const fs = require('fs');
require('dotenv').config();

// Liste di risposte sarcastiche per ogni comando
const HEY_RESPONSES = [
  "frocio torna a succhiare i cazzi",
  "tua madre si vergogna di averti fatto nascere",
  "la dignità l'hai persa insieme alle palle?",
  "sono bipolare",
  "vendo 3g di coca",
  "OFFERTA SPECIALE, SOLO X TE PUOI COMPRARE IL MIO SILENZIO, ANZICHE' DI PAGARE 10000000 EURO, SOLO PER TE IL MIO SILENZIO A 1000000 DA PAGARE CON TRE COMODE RATE DI 100000 AL MESE", 
  "il mio cazzo di 30cm",
  "a me nn interessa",
  "esplodi",
  "spaco botiglia amaso famiglia",
  "tutti a testa in giù",
  "hahaaha così simpatico che ho voglia di un cocktail con age gentile e benzodiazepine",
  "voglio il vicodin",
  "si però chi te l'ha chiesto",
  "mah sinceramente fregacazzi",
  "domani ti arriva la denuncia",
  "uhdudujeijikdjejd",
  "no",
  "spero che ti venga la salmonella",
  "domani ti svegli cacata",
  "domani ti svegli cacato",
  "spero che caghi a spruzzo e che ti esca l'intestino dal culo",
  "mado speriamo che domani ti svegli esploso",
  "speriamo che domani esci di casa in orizzontale, freddo ed elegante", 
  "hahahah... ti stai divertendo? bene accussì.. picchì l'ultima risata sarà a to'",
  "staresti bene in una vasca piena di acidi",
  "sei nzvato",
  "puzzi più di domenico e ce ne vuole",
  "ryan per piacere lavati il culo",
  "stanotte ti conviene dormire con un occhio aperto.",
  "perchè parli nessuno ti caga",
  "io so rumeno xke so de roma se vedo una dona io le strappo perizoma",
  "mr worldwide",
  "giochiamo a un gioco chi perde muore",
  "raga giochiamo ad among us nudi?",
  "succhiami il ciolone",
  "ti amo",
  "sta cessa",
  "raga qui cricate tanto i froci ma in verità siete gelosi perchè loro possono parcheggiare ovunque", 
  "microbo",
  "sei un ameba unicellulare",
];
const SCHIZZO_RESPONSES = [
  "MADONNA BEATA MA CHE CAZZO VUOI? DIMMI QUAL è IL PROBLEMA. COS è CHE FACCIO? PIANGO? NON POSSO? è TRE ANNI, TREEE ANNI CHE CI STAVO ASSIEME E MI HA LASCIATO PER UNA SPORCA PUTTANA. OKAY? CHE CAZZO VUOI"
];
const DIABLA_RESPONSES = [
  "io gucci tu ciucci",
  "io Rio de Janeiro tu Rio Mare",
  "io la scelta tu la sciolta",
  "io Hermès tu herpes", 
  "io coquette tu crocchette", 
  "io emozioni tu emorroidi",
  "io impegnata tu impregnata",
  "io ribelle tu bidella",
  "io coachella tu porcella",
  "io delizia tu perizia",
  "io hong kong tu king kong",
  "io sesso tu sessuale",
  "io amicizia tu sporcizia",
  "io la vacanza tu la fattanza",
  "io sboccio tu sbocchi",
  "io successo tu sul cesso",
  "io prada tu nada",
  "io fotogenica tu carta igienica", 
  "io sofisticata tu soffocata",
  "io sex appeal tu silk epil",
  "io in costume tu in questura",
  "io favola tu provola",
  "io hype tu skype",
  "io Manhattan tu in manette",
  "io barbie tu barbagianni",
  "io ghostbuster tu ghostata",
  "io Balenciaga tu Kiticaga",
  "io savoir-faire tu chanteclair",
  "io principessa tu cessa",
  "io diamante tu d'amianto",
  "io maradona tu merdona",
  "io lingotti d'oro tu li inghiotti duri",
  "io tramonti tu trimoni",
  "io raffinata tu costipata",
  "io Bora Bora tu pora pora",
  "io divina tu divana",
  "io rockstar tu dado star",
  "io in style tu in stalla",
  "io splendore tu splend'or",
  "io costa azzurra tu felce azzurra",
  "io Valentino tu volantini",
  "io perfetta tu porchetta",
  "io vita smeralda tu vita smerdata",
  "io divinità tu tigotà",
  "io Hello Kitty tu Kitty Synkula",
  "io viaggiatrice tu spacciatrice",
  "io Finesse tu Oviesse",
  "io monarca tu menarca",
  "io barocca tu baracca",
  "io in carriera tu in corriera",
  "io Ibiza tu Obeza"
];
const NO_RESPONSES = [
"Sofia non può uscire o semplicemente non ha voglia e siccome non ha nemmeno voglia di dirvelo ha incaricato me di farlo. Arrivederci e buon proseguimento!"
];
const RYAN_RESPONSES = [
  "Ryan molto belli i tuoi capelli blu, sembri proprio una lesbica comunista"
];

function getRandomResponse(list) {
  return list[Math.floor(Math.random() * list.length)];
}

async function getCurrentSpotifyTrack(accessToken) {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204) {
      return { error: 'Nessuna canzone in riproduzione' };
    }

    if (response.status === 401) {
      return { error: 'Token scaduto', needsReauth: true };
    }

    if (response.status === 403) {
      return { error: 'Spotify Premium richiesto per questa funzione' };
    }

    if (response.status === 429) {
      return { error: 'Troppe richieste, riprova tra qualche minuto' };
    }

    if (!response.ok) {
      console.error('Spotify API Error:', response.status, await response.text());
      return { error: `Errore Spotify (${response.status})` };
    }

    const data = await response.json();

    if (!data || !data.item) {
      return { error: 'Nessuna canzone in riproduzione' };
    }

    return {
      name: data.item.name,
      artists: data.item.artists.map(artist => artist.name).join(', '),
      album: data.item.album.name,
      is_playing: data.is_playing,
      external_url: data.item.external_urls.spotify,
      progress_ms: data.progress_ms,
      duration_ms: data.item.duration_ms
    };
  } catch (error) {
    console.error('Errore Spotify API:', error);
    return { error: 'Errore nel contattare Spotify' };
  }
}

async function handleCurrentSong(sock, chatId) {
  let token = await getValidSpotifyToken();

  if (!token) {
    const replyMessage = `🎵 *Connetti Spotify per usare !cur*

🔗 ${BASE_URL}

Vai al link, clicca su "Connetti Spotify" e autorizza l'accesso!`;

    await sock.sendMessage(chatId, { text: replyMessage });
    return;
  }

  let currentTrack = await getCurrentSpotifyTrack(token);

  if (currentTrack.needsReauth) {
    console.log('🔄 Token scaduto, tentativo di refresh automatico...');
    token = await getValidSpotifyToken(); // Forza il refresh
    if (token) {
      currentTrack = await getCurrentSpotifyTrack(token);
    }
  }

  if (currentTrack.error) {
    const replyMessage = currentTrack.needsReauth 
      ? `❌ ${currentTrack.error}

🔗 Riconnetti Spotify: ${BASE_URL}`
      : `❌ ${currentTrack.error}`;

    await sock.sendMessage(chatId, { text: replyMessage });
    return;
  }

  let progressText = '';
  if (currentTrack.progress_ms && currentTrack.duration_ms) {
    const progress = Math.floor((currentTrack.progress_ms / currentTrack.duration_ms) * 100);
    const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
    progressText = `\n⏱️ ${progressBar} ${progress}%`;
  }

  const statusIcon = currentTrack.is_playing ? '▶️' : '⏸️';
  const replyMessage = `🎵 *Stai ascoltando:*

${statusIcon} **${currentTrack.name}**
🎤 Artista: ${currentTrack.artists}
💿 Album: ${currentTrack.album}${progressText}

🔗 ${currentTrack.external_url}`;

  await sock.sendMessage(chatId, { text: replyMessage });
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('Scansiona questo QR code con WhatsApp:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connessione chiusa per:', lastDisconnect.error, ', riconnetto:', shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('Bot WhatsApp connesso!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    const message = m.messages[0];
    if (!message.message || message.key.fromMe) return;

    const text = message.message.conversation || message.message.extendedTextMessage?.text || '';
    const chatId = message.key.remoteJid;

    if (text.toLowerCase() === '!hey') {
      await sock.sendMessage(chatId, { text: getRandomResponse(HEY_RESPONSES) });
    } else if (text.toLowerCase() === '!schizzo') {
      await sock.sendMessage(chatId, { text: getRandomResponse(SCHIZZO_RESPONSES) });
    } else if (text.toLowerCase() === '!diabla') {
      await sock.sendMessage(chatId, { text: getRandomResponse(DIABLA_RESPONSES) });
      } else if (text.toLowerCase() === '!no') {
        await sock.sendMessage(chatId, { text: getRandomResponse(NO_RESPONSES) });
      } else if (text.toLowerCase() === '!ryan') {
        await sock.sendMessage(chatId, { text: getRandomResponse(RYAN_RESPONSES) });
      } else if (text.toLowerCase() === '!cur') {
        await handleCurrentSong(sock, chatId);
    }
  });
}

startBot();

// Configurazione Express per Spotify
const app = express();

// Configurazione per Replit
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BASE_URL = 'https://workspace-nafisofia110.replit.app';
const REDIRECT_URI = `${BASE_URL}/callback`;

// Crea la cartella tokens se non esiste
if (!fs.existsSync('tokens')) {
  fs.mkdirSync('tokens');
}

// Funzione per refreshare il token Spotify
async function refreshSpotifyToken(refreshToken) {
  try {
    const body = qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    });

    const data = await response.json();

    if (data.error) {
      console.error('Errore refresh token:', data.error);
      return null;
    }

    // Salva il nuovo token
    const newTokens = {
      access_token: data.access_token,
      refresh_token: refreshToken, // Il refresh token rimane lo stesso
      expires_in: data.expires_in,
      timestamp: Date.now()
    };

    const fileName = `tokens/spotify_${Date.now()}.json`;
    fs.writeFileSync(fileName, JSON.stringify(newTokens, null, 2));

    console.log('✅ Token Spotify refreshato con successo!');
    return data.access_token;

  } catch (error) {
    console.error('Errore nel refresh del token:', error);
    return null;
  }
}

// Funzione per ottenere il token Spotify valido (con refresh automatico)
async function getValidSpotifyToken() {
  if (!fs.existsSync('tokens')) {
    return null;
  }

  const files = fs.readdirSync('tokens');
  if (files.length === 0) {
    return null;
  }

  // Prendi il token più recente
  const lastFile = files.sort().reverse()[0];
  const tokenData = JSON.parse(fs.readFileSync('tokens/' + lastFile, 'utf8'));

  // Verifica se il token è ancora valido (con margine di 5 minuti)
  const now = Date.now();
  const tokenAge = now - tokenData.timestamp;
  const tokenExpiry = (tokenData.expires_in - 300) * 1000; // 5 minuti prima della scadenza

  if (tokenAge < tokenExpiry) {
    return tokenData.access_token;
  }

  // Token scaduto o in scadenza, prova a refresharlo
  if (tokenData.refresh_token) {
    console.log('🔄 Token Spotify in scadenza, effettuo refresh...');
    const newAccessToken = await refreshSpotifyToken(tokenData.refresh_token);
    return newAccessToken;
  }

  return null;
}

// ROUTE principale: mostra status del bot
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sofia's Bot Dashboard</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(to bottom, #1db954 0%, #000000 100%);
            min-height: 100vh;
            color: white;
          }

          .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
          }

          .header {
            text-align: center;
            margin-bottom: 40px;
            animation: fadeInDown 1s ease-out;
          }

          .logo {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }

          .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
          }

          .cards-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
          }

          .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.3s ease;
            animation: fadeInUp 1s ease-out;
          }

          .card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 45px rgba(0,0,0,0.2);
          }

          .card-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .emoji {
            font-size: 2rem;
          }

          .command-list {
            list-style: none;
          }

          .command-item {
            background: rgba(255,255,255,0.1);
            margin: 10px 0;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #1db954;
            transition: all 0.3s ease;
          }

          .command-item:hover {
            background: rgba(255,255,255,0.2);
            transform: translateX(5px);
          }

          .command {
            font-weight: bold;
            color: #1db954;
            font-family: 'Courier New', monospace;
          }

          .description {
            margin-top: 5px;
            opacity: 0.9;
            font-size: 0.9rem;
          }

          .spotify-section {
            background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
            color: white;
          }

          .spotify-buttons {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 15px 25px;
            background: rgba(255,255,255,0.2);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            transition: all 0.3s ease;
            border: 2px solid rgba(255,255,255,0.3);
          }

          .btn:hover {
            background: rgba(255,255,255,0.3);
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          }

          .btn-primary {
            background: rgba(255,255,255,0.9);
            color: #1db954;
          }

          .btn-primary:hover {
            background: white;
            color: #1db954;
          }

          .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: #1db954;
            border-radius: 50%;
            margin-right: 10px;
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(29, 185, 84, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(29, 185, 84, 0); }
            100% { box-shadow: 0 0 0 0 rgba(29, 185, 84, 0); }
          }

          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .footer {
            text-align: center;
            margin-top: 40px;
            opacity: 0.7;
            font-size: 0.9rem;
          }

          @media (max-width: 768px) {
            .container { padding: 15px; }
            .logo { font-size: 2rem; }
            .cards-container { grid-template-columns: 1fr; gap: 20px; }
            .spotify-buttons { flex-direction: column; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🤖 Sofia's bot</div>
            <div class="subtitle">
              <span class="status-indicator"></span>
              Dashboard di Controllo Attiva
            </div>
          </div>

          <div class="cards-container">
            <div class="card spotify-section">
              <div class="card-title">
                <span class="emoji">🎵</span>
                Integrazione Spotify
              </div>
              <p style="margin-bottom: 25px; opacity: 0.9;">
                Connetti il tuo account Spotify per abilitare funzioni musicali avanzate nel bot.
              </p>
              <div class="spotify-buttons">
                <a href="/login" class="btn btn-primary">
                  <span>🔗</span>
                  Connetti Spotify
                </a>
                <a href="/test" class="btn">
                  <span>🔍</span>
                  Verifica Token
                </a>
                <a href="/clear" class="btn" style="background: rgba(255,0,0,0.2);">
                  <span>🗑️</span>
                  Cancella Token
                </a>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>💝 Made with love by Sofia Nafi</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// ROUTE: /login → reindirizza a Spotify per fare il login
app.get('/login', (req, res) => {
  const scope = 'user-read-currently-playing user-read-playback-state';
  const query = qs.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI
  });
  res.redirect('https://accounts.spotify.com/authorize?' + query);
});

// ROUTE: /callback → riceve il codice da Spotify, ottiene token e salva
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  const body = qs.stringify({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
  });

  const data = await response.json();

  if (data.error) {
    return res.send('Errore nel login Spotify: ' + JSON.stringify(data));
  }

  const tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    timestamp: Date.now()
  };

  // Salva i token con un file tipo tokens/spotify_123456.json
  const fileName = `tokens/spotify_${Date.now()}.json`;
  fs.writeFileSync(fileName, JSON.stringify(tokens, null, 2));

  res.send('✅ Accesso effettuato! I token sono stati salvati.');
});

// ROUTE: /test → mostra i token salvati (per debug)
app.get('/test', (req, res) => {
  const files = fs.readdirSync('tokens');
  if (files.length === 0) return res.send('Nessun token salvato ancora.');
  const lastFile = files.sort().reverse()[0];
  const tokenData = fs.readFileSync('tokens/' + lastFile);
  res.setHeader('Content-Type', 'application/json');
  res.send(tokenData);
});

// ROUTE: /clear → cancella tutti i token salvati
app.get('/clear', (req, res) => {
  try {
    const files = fs.readdirSync('tokens');
    files.forEach(file => {
      fs.unlinkSync(`tokens/${file}`);
    });
    res.send('✅ Tutti i token sono stati cancellati. Dovrai riconnetterti a Spotify.');
  } catch (error) {
    res.send('❌ Errore nella cancellazione dei token: ' + error.message);
  }
});

// Avvia il server Express
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server Express attivo su porta ${PORT}`);
  console.log(`URL del bot: ${BASE_URL}`);
  console.log(`Redirect URI: ${REDIRECT_URI}`);
  console.log(`🌐 Server accessibile dall'esterno su: https://${BASE_URL.split('//')[1]}`);
});