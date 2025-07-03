const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

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

// Funzione per prendere una risposta casuale da una lista
function getRandomResponse(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Setup del client WhatsApp con autenticazione locale
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

// Quando serve il QR code per l'accesso
client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('Scansiona questo QR code con WhatsApp per collegare il bot.');
});

// Quando il bot è pronto
client.on('ready', () => {
  console.log('Bot WhatsApp pronto!');
});

// Gestione messaggi ricevuti
client.on('message', (message) => {
  const text = message.body.toLowerCase();

  if(text === '!hey') {
    message.reply(getRandomResponse(HEY_RESPONSES));
  } else if(text === '!schizzo') {
    message.reply(getRandomResponse(SCHIZZO_RESPONSES));
  } else if(text === '!diabla') {
    message.reply(getRandomResponse(DIABLA_RESPONSES));
  }
});

// Avvio del client
client.initialize();
