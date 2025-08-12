// 🧠 CONTEXT ANALYZER - EXTRACTEUR D'INFORMATIONS v2.1
// ======================================================
// Améliorations: extraction de noms, dates québécoises, casse

class ContextAnalyzer {
  constructor() {
    this.patterns = {
      // PATTERNS DE NOMS AMÉLIORÉS
      name: [
        /(?:c'est|je m'appelle|mon nom est)\s+([A-Za-zÀ-ÿ\-\s]+?)(?:\s*[,\.\!]|$)/i,
        /(?:moi c'est|je suis)\s+([A-Za-zÀ-ÿ\-\s]+?)(?:\s*[,\.\!]|$)/i,
        /^([A-Za-zÀ-ÿ\-\s]+?)\s+(?:à l'appareil|au téléphone)/i,
        /(?:ici|speaking)\s+([A-Za-zÀ-ÿ\-\s]+?)(?:\s*[,\.\!]|$)/i,
        // NOUVEAU: pattern pour "c'est [Nom]"
        /,\s*c'est\s+([A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+)*)/,
      ],

      // SERVICES
      service: [
        /\b(coupe|barbe|taille|rasage|coloration|teinture|mise en plis|permanente)\b/gi,
        /\b(combo|forfait|les deux|coupe et barbe)\b/gi,
      ],

      // DATES AMÉLIORÉES (québécoises)
      date: [
        /\b(aujourd'hui|à matin|à soir|ce matin|ce soir|tantôt)\b/i,
        /\b(demain|après-demain|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i,
        /\b(cette semaine|semaine prochaine|fin de semaine)\b/i,
        /\b(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b/i,
      ],

      // PÉRIODES ET HEURES
      time: [
        /\b(\d{1,2}h\d{0,2}|\d{1,2}:\d{2})\b/i,
        /\b(matin|après-midi|midi|soir|am|pm)\b/i,
        /\b(tôt|tard|ouverture|fermeture)\b/i,
      ],

      periode: [
        /\b(matin|après-midi|midi|soir|soirée)\b/i,
        /\b(am|pm|avant-midi)\b/i,
      ],

      // BARBIERS (insensible à la casse)
      barbier: [
        /\b(marco|tony|julie|françois)\b/i,
        /\b(n'importe qui|peu importe|premier dispo|n'importe|aucune préférence)\b/i,
      ],

      // ACTIONS
      action: [/\b(annuler|cancel|reporter|déplacer|changer)\b/i],

      // URGENCE
      urgency: [
        /\b(urgent|urgence|maintenant|tout de suite|asap|immédiatement)\b/i,
      ],

      // INCERTITUDE
      uncertain: [
        /\b(peut-être|j'sais pas|je ne sais pas|pas sûr|incertain)\b/i,
      ],

      // FRUSTRATION
      frustration: [
        /\b(déjà dit|je répète|encore une fois|combien de fois)\b/i,
        /[!]{2,}/, // Multiple exclamations
      ],
    };
  }

  analyzeUserInput(input, session = {}) {
    const normalized = this.normalizeInput(input);
    const extracted = {};

    // 1. EXTRAIRE LE NOM/CLIENT
    for (const pattern of this.patterns.name) {
      const match = input.match(pattern); // Utiliser input original pour la casse
      if (match) {
        extracted.client = this.cleanName(match[1]);
        extracted.callerName = extracted.client; // Double pour compatibilité
        break;
      }
    }

    // 2. EXTRAIRE LES SERVICES
    const services = [];
    for (const pattern of this.patterns.service) {
      const matches = normalized.matchAll(new RegExp(pattern, "gi"));
      for (const match of matches) {
        const service = match[0].toLowerCase();
        if (service === "les deux" || service === "coupe et barbe") {
          services.push("coupe", "barbe");
        } else if (!services.includes(service)) {
          services.push(service);
        }
      }
    }
    if (services.length > 0) {
      extracted.service = services.length === 1 ? services[0] : services;
    }

    // 3. EXTRAIRE ET NORMALISER LES DATES
    for (const pattern of this.patterns.date) {
      const match = normalized.match(pattern);
      if (match) {
        let date = match[0];
        // Convertir les expressions québécoises
        if (date === "à matin" || date === "ce matin") {
          extracted.date = "aujourd'hui";
          extracted.periode = "matin";
        } else if (date === "à soir" || date === "ce soir") {
          extracted.date = "aujourd'hui";
          extracted.periode = "soir";
        } else if (date === "tantôt") {
          extracted.date = "aujourd'hui";
        } else {
          extracted.date = date;
        }
        break;
      }
    }

    // 4. EXTRAIRE LA PÉRIODE (si pas déjà fait)
    if (!extracted.periode) {
      for (const pattern of this.patterns.periode) {
        const match = normalized.match(pattern);
        if (match) {
          extracted.periode = match[1].toLowerCase();
          break;
        }
      }
    }

    // 5. EXTRAIRE L'HEURE
    for (const pattern of this.patterns.time) {
      const match = normalized.match(pattern);
      if (match) {
        extracted.time = match[0];
        break;
      }
    }

    // 6. EXTRAIRE LE BARBIER (avec bonne casse)
    for (const pattern of this.patterns.barbier) {
      const match = normalized.match(pattern);
      if (match) {
        const barbierName = match[1].toLowerCase();
        // Capitaliser correctement
        if (["marco", "tony", "julie", "françois"].includes(barbierName)) {
          extracted.barbier =
            barbierName.charAt(0).toUpperCase() + barbierName.slice(1);
        } else {
          extracted.barbier = match[1]; // Pour "n'importe", etc.
        }
        break;
      }
    }

    // 7. AUTRES EXTRACTIONS
    for (const field of ["action", "urgency", "uncertain", "frustration"]) {
      for (const pattern of this.patterns[field]) {
        if (pattern.test(normalized)) {
          extracted[field] = true;
          break;
        }
      }
    }

    // 8. DÉTECTER L'INTENTION
    extracted.intent = this.detectIntent(normalized);

    // 9. DÉTECTER LE BESOIN
    if (normalized.includes("ouvert") || normalized.includes("horaire")) {
      extracted.besoin = "horaires";
    } else if (
      normalized.includes("prix") ||
      normalized.includes("combien") ||
      normalized.includes("coût")
    ) {
      extracted.besoin = "prix";
    } else if (extracted.intent === "booking") {
      extracted.besoin = "rdv";
    }

    return extracted;
  }

  cleanName(name) {
    return name
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  normalizeInput(input) {
    return input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['']/g, "'");
  }

  detectIntent(input) {
    if (/\b(rendez-vous|rdv|réserver|booker|prendre)\b/i.test(input)) {
      return "booking";
    }
    if (/\b(prix|coût|combien|tarif)\b/i.test(input)) {
      return "pricing";
    }
    if (/\b(annuler|cancel|reporter)\b/i.test(input)) {
      return "cancellation";
    }
    if (/\b(bonjour|salut|allo|hey)\b/i.test(input)) {
      return "greeting";
    }
    if (/\b(disponible|libre|là)\b/i.test(input)) {
      return "availability";
    }
    if (/\b(recommand|conseil|suggestion)\b/i.test(input)) {
      return "recommendation";
    }
    if (/\b(qui|quel|comment)\b/i.test(input)) {
      return "info";
    }
    return "general";
  }

  generateResponse(session) {
    const missing = [];

    if (!session.extractedInfo?.service) missing.push("service");
    if (!session.extractedInfo?.date) missing.push("date");
    if (!session.extractedInfo?.time && !session.extractedInfo?.barbier) {
      missing.push("heure ou barbier");
    }

    if (missing.length === 0) {
      return "Parfait! Je résume: " + this.buildSummary(session.extractedInfo);
    }

    const field = missing[0];
    const questions = {
      service: "Quel service désirez-vous? Coupe, barbe ou les deux?",
      date: "Pour quelle journée souhaitez-vous votre rendez-vous?",
      "heure ou barbier": "À quelle heure préférez-vous? Ou avec quel barbier?",
    };

    return questions[field] || "Comment puis-je vous aider?";
  }

  buildSummary(info) {
    let summary = [];
    if (info.service)
      summary.push(
        Array.isArray(info.service) ? info.service.join(" et ") : info.service,
      );
    if (info.date) summary.push(`le ${info.date}`);
    if (info.periode) summary.push(`(${info.periode})`);
    if (info.time) summary.push(`à ${info.time}`);
    if (info.barbier) summary.push(`avec ${info.barbier}`);
    return summary.join(", ") + ". C'est bien ça?";
  }

  // Compatibilité
  analyzeInput(input, session) {
    return this.analyzeUserInput(input, session);
  }
}

module.exports = ContextAnalyzer;
