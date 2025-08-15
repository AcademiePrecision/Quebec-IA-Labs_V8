// 📞 INTÉGRATION TWILIO - GESTION APPELS AUTOMATISÉE

import { Client } from '../types/salon-ai';

interface TwilioCallWebhook {
  CallSid: string;
  From: string;
  To: string;
  CallStatus: 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer';
  Direction: 'inbound' | 'outbound';
}

interface ElevenLabsResponse {
  audio_url: string;
  duration: number;
  text: string;
}

class TwilioIntegration {
  private twilioClient: any;
  private accountSid: string;
  private authToken: string;
  private elevenLabsApiKey: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || '';
    this.initializeTwilio();
  }

  private initializeTwilio() {
    // En production, initialiser le vrai client Twilio
    // const twilio = require('twilio');
    // this.twilioClient = twilio(this.accountSid, this.authToken);
    console.log('Twilio initialisé pour sandbox');
  }

  // 📞 WEBHOOK PRINCIPAL POUR APPELS ENTRANTS
  async handleIncomingCall(webhook: TwilioCallWebhook, salonId: string): Promise<string> {
    try {
      console.log(`📞 Appel entrant de ${webhook.From} pour salon ${salonId}`);
      
      // 1. Identification du client par numéro
      const client = await this.identifyClient(webhook.From);
      
      // 2. Génération de la réponse vocale personnalisée
      const greeting = this.generatePersonalizedGreeting(client, salonId);
      
      // 3. Conversion texte vers voix avec ElevenLabs
      const audioResponse = await this.textToSpeech(greeting, client?.persona_type || 'standard');
      
      // 4. Génération TwiML pour répondre à l'appel
      const twimlResponse = this.generateTwiMLResponse(audioResponse, webhook.CallSid);
      
      return twimlResponse;
      
    } catch (error) {
      console.error('Erreur gestion appel entrant:', error);
      return this.generateErrorTwiML();
    }
  }

  // 🎤 WEBHOOK POUR TRAITEMENT VOCAL CLIENT
  async handleVoiceInput(
    callSid: string, 
    speechResult: string, 
    salonId: string
  ): Promise<string> {
    try {
      console.log(`🎤 Reconnaissance vocale: "${speechResult}" pour appel ${callSid}`);
      
      // 1. Analyse NLP de la demande client
      const intent = await this.analyzeClientIntent(speechResult);
      
      // 2. Traitement de la demande selon l'intent
      const response = await this.processClientRequest(intent, callSid, salonId);
      
      // 3. Génération réponse vocale
      const audioResponse = await this.textToSpeech(response.text, response.tone);
      
      // 4. Actions automatiques (réservation, etc.)
      if (response.actions && response.actions.length > 0) {
        await this.executeActions(response.actions, callSid, salonId);
      }
      
      return this.generateTwiMLResponse(audioResponse, callSid, response.nextStep);
      
    } catch (error) {
      console.error('Erreur traitement vocal:', error);
      return this.generateRetryTwiML();
    }
  }

  // 🧠 ANALYSE INTENT CLIENT
  private async analyzeClientIntent(speechText: string): Promise<any> {
    // Simulation de NLP avec OpenAI ou service similaire
    const intents = {
      'booking_request': /réservation|rendez.vous|appointment/i,
      'modification_request': /modifier|changer|reprogrammer/i,
      'cancellation_request': /annuler|cancel/i,
      'pricing_inquiry': /prix|coût|tarif/i,
      'availability_inquiry': /disponible|libre|ouvert/i,
      'complaint': /problème|mécontent|insatisfait/i,
      'compliment': /merci|parfait|excellent/i
    };

    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(speechText)) {
        return {
          intent,
          confidence: 0.8,
          entities: this.extractEntities(speechText, intent),
          originalText: speechText
        };
      }
    }

    return {
      intent: 'unknown',
      confidence: 0.3,
      entities: {},
      originalText: speechText
    };
  }

  // 📋 EXTRACTION ENTITÉS
  private extractEntities(text: string, intent: string): any {
    const entities: any = {};
    
    // Date/heure
    const timePatterns = [
      /(\d{1,2}h\d{0,2})/g,
      /(matin|après.midi|soir)/g,
      /(aujourd'hui|demain|cette semaine)/g,
      /(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/g
    ];
    
    timePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.time_references = matches;
      }
    });

    // Services
    const servicePatterns = [
      /(coupe|coiffure)/g,
      /(barbe|rasage)/g,
      /(coloration|couleur)/g,
      /(shampooing|lavage)/g
    ];
    
    servicePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.services = matches;
      }
    });

    // Barbiers
    const barberNames = ['marco', 'jessica', 'dimitri', 'marie', 'jean'];
    barberNames.forEach(name => {
      if (text.toLowerCase().includes(name)) {
        entities.preferred_barber = name;
      }
    });

    return entities;
  }

  // 🎯 TRAITEMENT DEMANDE CLIENT
  private async processClientRequest(intent: any, callSid: string, salonId: string): Promise<any> {
    const client = await this.getClientByCallSid(callSid);
    
    switch (intent.intent) {
      case 'booking_request':
        return await this.handleBookingRequest(intent, client, salonId);
      
      case 'modification_request':
        return await this.handleModificationRequest(intent, client, salonId);
      
      case 'cancellation_request':
        return await this.handleCancellationRequest(intent, client, salonId);
      
      case 'pricing_inquiry':
        return await this.handlePricingInquiry(intent, client, salonId);
      
      case 'availability_inquiry':
        return await this.handleAvailabilityInquiry(intent, client, salonId);
      
      case 'complaint':
        return await this.handleComplaint(intent, client, salonId);
      
      case 'compliment':
        return await this.handleCompliment(intent, client, salonId);
      
      default:
        return {
          text: "Je n'ai pas bien compris votre demande. Pouvez-vous répéter différemment?",
          tone: 'apologetic',
          nextStep: 'listen',
          actions: []
        };
    }
  }

  // 📅 GESTION DEMANDE RÉSERVATION
  private async handleBookingRequest(intent: any, client: Client | null, salonId: string): Promise<any> {
    // Logique de réservation basée sur les entités extraites
    const preferredTime = intent.entities.time_references?.[0];
    const preferredService = intent.entities.services?.[0] || 'coupe';
    const preferredBarber = intent.entities.preferred_barber;

    // Simulation recherche créneaux disponibles
    const availableSlots = await this.findAvailableSlots(salonId, preferredTime, preferredBarber);
    
    if (availableSlots.length > 0) {
      const bestSlot = availableSlots[0];
      
      return {
        text: `Parfait! Je peux vous proposer ${preferredService} ${preferredTime ? 'à ' + preferredTime : 'demain'} avec ${bestSlot.barber}. Le prix sera de ${bestSlot.price}$. Voulez-vous confirmer?`,
        tone: 'helpful',
        nextStep: 'confirm_booking',
        actions: [
          {
            type: 'create_tentative_booking',
            data: {
              client_id: client?.id,
              slot: bestSlot,
              service: preferredService
            }
          }
        ]
      };
    } else {
      return {
        text: `Désolé, nous n'avons plus de disponibilité ${preferredTime}. Puis-je vous proposer d'autres créneaux?`,
        tone: 'apologetic',
        nextStep: 'suggest_alternatives',
        actions: [
          {
            type: 'find_alternative_slots',
            data: { original_request: intent }
          }
        ]
      };
    }
  }

  // 🎵 CONVERSION TEXTE VERS VOIX (ELEVENLABS)
  private async textToSpeech(text: string, voiceStyle: string = 'standard'): Promise<ElevenLabsResponse> {
    try {
      // Configuration voix selon le style
      const voiceConfig = this.getVoiceConfig(voiceStyle);
      
      // Simulation appel ElevenLabs API
      console.log(`🎵 TTS: "${text}" avec style ${voiceStyle}`);
      
      // En production, faire le vrai appel API
      /*
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceConfig.voice_id, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenLabsApiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: voiceConfig.stability,
            similarity_boost: voiceConfig.similarity_boost,
            style: voiceConfig.style,
            use_speaker_boost: true
          }
        })
      });
      
      const audioBuffer = await response.arrayBuffer();
      */
      
      // Pour l'instant, simulation
      return {
        audio_url: `https://temp-audio.com/${Date.now()}.mp3`,
        duration: text.length * 0.1, // Estimation durée
        text: text
      };
      
    } catch (error) {
      console.error('Erreur TTS:', error);
      throw error;
    }
  }

  // 🎤 CONFIGURATION VOIX
  private getVoiceConfig(style: string): any {
    const configs = {
      'standard': {
        voice_id: 'fr-CA-female-warm',
        stability: 0.75,
        similarity_boost: 0.75,
        style: 0.5
      },
      'marie_claude': {
        voice_id: 'fr-CA-female-professional',
        stability: 0.8,
        similarity_boost: 0.8,
        style: 0.3
      },
      'roger': {
        voice_id: 'fr-CA-female-respectful',
        stability: 0.9,
        similarity_boost: 0.85,
        style: 0.2
      },
      'kevin': {
        voice_id: 'fr-CA-female-friendly',
        stability: 0.7,
        similarity_boost: 0.7,
        style: 0.7
      },
      'sophie': {
        voice_id: 'fr-CA-female-understanding',
        stability: 0.75,
        similarity_boost: 0.8,
        style: 0.6
      }
    };
    
    return configs[style] || configs['standard'];
  }

  // 📱 GÉNÉRATION TWIML
  private generateTwiMLResponse(audioResponse: ElevenLabsResponse, callSid: string, nextStep?: string): string {
    let twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${audioResponse.audio_url}</Play>`;

    if (nextStep === 'listen') {
      twiml += `
  <Gather input="speech" timeout="10" speechTimeout="3" action="/webhook/voice-input/${callSid}" method="POST">
    <Say voice="Polly.Celine-fr-CA">Je vous écoute...</Say>
  </Gather>`;
    } else if (nextStep === 'confirm_booking') {
      twiml += `
  <Gather input="speech dtmf" timeout="10" numDigits="1" action="/webhook/confirm/${callSid}" method="POST">
    <Say voice="Polly.Celine-fr-CA">Appuyez sur 1 pour confirmer, 2 pour modifier, ou dites oui ou non.</Say>
  </Gather>`;
    }

    twiml += `
</Response>`;

    return twiml;
  }

  // ❌ TWIML D'ERREUR
  private generateErrorTwiML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Celine-fr-CA">
    Désolé, nous rencontrons des difficultés techniques. 
    Un opérateur va vous répondre dans un instant.
  </Say>
  <Dial>+15551234567</Dial>
</Response>`;
  }

  // 🔄 TWIML DE RETRY
  private generateRetryTwiML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Celine-fr-CA">
    Je n'ai pas bien compris. Pouvez-vous répéter plus clairement?
  </Say>
  <Gather input="speech" timeout="10" speechTimeout="3" action="/webhook/voice-retry" method="POST">
    <Say voice="Polly.Celine-fr-CA">Je vous écoute...</Say>
  </Gather>
</Response>`;
  }

  // 📞 APPELS SORTANTS AUTOMATIQUES
  async makeOutboundCall(
    toNumber: string, 
    message: string, 
    salonId: string,
    callType: 'confirmation' | 'reminder' | 'cancellation' = 'reminder'
  ): Promise<string> {
    try {
      // Génération audio pour le message
      const audioResponse = await this.textToSpeech(message, 'standard');
      
      // Création de l'appel Twilio
      const call = await this.twilioClient.calls.create({
        twiml: `<Response><Play>${audioResponse.audio_url}</Play></Response>`,
        to: toNumber,
        from: this.getSalonPhone(salonId)
      });
      
      console.log(`📞 Appel sortant créé: ${call.sid} vers ${toNumber}`);
      return call.sid;
      
    } catch (error) {
      console.error('Erreur appel sortant:', error);
      throw error;
    }
  }

  // 📱 SMS AUTOMATIQUES
  async sendSMS(
    toNumber: string, 
    message: string, 
    salonId: string
  ): Promise<string> {
    try {
      const sms = await this.twilioClient.messages.create({
        body: message,
        to: toNumber,
        from: this.getSalonPhone(salonId)
      });
      
      console.log(`📱 SMS envoyé: ${sms.sid} vers ${toNumber}`);
      return sms.sid;
      
    } catch (error) {
      console.error('Erreur SMS:', error);
      throw error;
    }
  }

  // Méthodes utilitaires
  private generatePersonalizedGreeting(client: Client | null, salonId: string): string {
    if (!client) {
      return "Bonjour! Vous appelez le salon. Comment puis-je vous aider aujourd'hui?";
    }

    switch (client.persona_type) {
      case 'marie_claude':
        return `Bonjour ${client.name}, c'est toujours un plaisir de vous entendre. Votre rendez-vous habituel?`;
      case 'roger':
        return `Bonjour Monsieur ${client.name}, client privilégié. Que puis-je faire pour vous immédiatement?`;
      case 'kevin':
        return `Salut ${client.name}! Content de te revoir au téléphone. Comment ça va?`;
      case 'sophie':
        return `Bonjour ${client.name}, pour vous et les enfants aujourd'hui?`;
      default:
        return `Bonjour ${client.name}, comment puis-je vous aider?`;
    }
  }

  private async identifyClient(phoneNumber: string): Promise<Client | null> {
    // Simulation recherche client par numéro
    console.log(`🔍 Recherche client: ${phoneNumber}`);
    return null; // En production, requête base de données
  }

  private async getClientByCallSid(callSid: string): Promise<Client | null> {
    // Récupération client par call ID
    return null; // En production, lookup dans cache/DB
  }

  private async findAvailableSlots(salonId: string, preferredTime?: string, preferredBarber?: string): Promise<any[]> {
    // Simulation recherche créneaux
    return [
      {
        time: '14:30',
        barber: 'Marco',
        price: 35,
        duration: 30
      }
    ];
  }

  private getSalonPhone(salonId: string): string {
    // Récupération numéro Twilio du salon
    return '+15551234567'; // Numéro Twilio par défaut
  }

  private async executeActions(actions: any[], callSid: string, salonId: string): Promise<void> {
    // Exécution des actions automatiques (réservations, etc.)
    for (const action of actions) {
      console.log(`🎯 Exécution action: ${action.type}`, action.data);
      // Implémentation des actions spécifiques
    }
  }

  // Placeholder pour les autres méthodes
  private async handleModificationRequest(intent: any, client: Client | null, salonId: string): Promise<any> {
    return { text: "Modification en cours...", tone: 'helpful', nextStep: 'listen', actions: [] };
  }

  private async handleCancellationRequest(intent: any, client: Client | null, salonId: string): Promise<any> {
    return { text: "Annulation en cours...", tone: 'understanding', nextStep: 'confirm', actions: [] };
  }

  private async handlePricingInquiry(intent: any, client: Client | null, salonId: string): Promise<any> {
    return { text: "Nos prix débutent à 25$ pour une coupe simple...", tone: 'informative', nextStep: 'listen', actions: [] };
  }

  private async handleAvailabilityInquiry(intent: any, client: Client | null, salonId: string): Promise<any> {
    return { text: "Nous avons de la disponibilité cette semaine...", tone: 'helpful', nextStep: 'listen', actions: [] };
  }

  private async handleComplaint(intent: any, client: Client | null, salonId: string): Promise<any> {
    return { text: "Je suis désolé d'apprendre cela. Laissez-moi arranger la situation...", tone: 'apologetic', nextStep: 'escalate', actions: [] };
  }

  private async handleCompliment(intent: any, client: Client | null, salonId: string): Promise<any> {
    return { text: "Merci beaucoup! Nous sommes ravis que vous soyez satisfait.", tone: 'grateful', nextStep: 'listen', actions: [] };
  }
}

export default new TwilioIntegration();