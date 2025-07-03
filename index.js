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


// Funzione per prendere una risposta casuale da una lista
function getRandomResponse(list) {
  return list[Math.floor(Math.random() * list.length)];
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
    }
  });
}

startBot();

// Configurazione Express per Spotify
const app = express();

// Prendi i dati dal .env
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Crea la cartella tokens se non esiste
if (!fs.existsSync('tokens')) {
  fs.mkdirSync('tokens');
}

// ROUTE principale: mostra status del bot
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>WhatsApp Bot Status</title></head>
      <body>
        <h1>Osvaldo Bot è attivo!</h1>
        <p>Il bot sta funzionando e risponde ai comandi:</p>
        <ul>
          <li><strong>!hey</strong> - il 99% sono insulti</li>
          <li><strong>!schizzo</strong> - la risposta della tipa al tipo di schizzo male</li>
          <li><strong>!diabla</strong> - Frasi da diabla</li>
          <li><strong>!no</strong> - Risposta di Sofia</li>
          <li><strong>!ryan</strong> - Messaggio per Ryan</li>
        </ul>
        <hr>
        <h2>Spotify Integration</h2>
        <p><a href="/login">🎵 Connetti Spotify</a></p>
        <p><a href="/test">🔍 Verifica Token Spotify</a></p>
      </body>
    </html>
  `);
});

// ROUTE: /login → reindirizza a Spotify per fare il login
app.get('/login', (req, res) => {
  const scope = 'user-read-currently-playing';
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

// Avvia il server Express
app.listen(5000, '0.0.0.0', () => {
  console.log('✅ Server Express attivo su porta 5000');
  console.log('URL del bot: https://your-repl-name.your-username.repl.co');
});