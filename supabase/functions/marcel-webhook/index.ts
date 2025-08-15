// Marcel AI Webhook Handler - Supabase Edge Function
// Handles Twilio webhooks for appointment booking automation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TwilioWebhookBody {
  From: string
  To: string
  Body: string
  MessageSid: string
  AccountSid: string
}

interface MarcelContext {
  conversationId?: string
  clientId?: string
  isRecognized: boolean
  preferredLanguage: 'fr' | 'en'
  currentIntent?: string
  entities?: Record<string, any>
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse Twilio webhook
    const formData = await req.formData()
    const twilioData: TwilioWebhookBody = {
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      Body: formData.get('Body') as string,
      MessageSid: formData.get('MessageSid') as string,
      AccountSid: formData.get('AccountSid') as string,
    }

    const phoneNumber = twilioData.From.replace(/[^\d+]/g, '')
    const message = twilioData.Body.toLowerCase().trim()

    // Get or create conversation
    let { data: conversation } = await supabase
      .from('marcel_conversations')
      .select('*')
      .eq('phone_number', phoneNumber)
      .is('ended_at', null)
      .single()

    if (!conversation) {
      // Check if client exists
      const { data: account } = await supabase
        .from('accounts')
        .select('*, profiles(*)')
        .eq('phone', phoneNumber)
        .single()

      // Create new conversation
      const { data: newConversation } = await supabase
        .from('marcel_conversations')
        .insert({
          phone_number: phoneNumber,
          account_id: account?.id,
          is_recognized_client: !!account,
          client_name: account ? `${account.first_name} ${account.last_name}` : null,
          preferred_language: account?.preferred_language || 'fr',
          session_id: `marcel_${Date.now()}_${phoneNumber}`,
        })
        .select()
        .single()

      conversation = newConversation
    }

    // Store inbound message
    await supabase
      .from('marcel_messages')
      .insert({
        conversation_id: conversation.id,
        direction: 'inbound',
        content: twilioData.Body,
        twilio_message_sid: twilioData.MessageSid,
      })

    // Process intent and entities
    const intent = detectIntent(message)
    const entities = extractEntities(message)

    // Update conversation state
    const updatedState = {
      ...conversation.conversation_state,
      lastIntent: intent,
      lastEntities: entities,
      messageCount: (conversation.message_count || 0) + 1,
    }

    await supabase
      .from('marcel_conversations')
      .update({
        current_intent: intent,
        conversation_state: updatedState,
        message_count: updatedState.messageCount,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversation.id)

    // Generate response based on intent
    const response = await generateResponse(
      supabase,
      conversation,
      intent,
      entities,
      message
    )

    // Store outbound message
    await supabase
      .from('marcel_messages')
      .insert({
        conversation_id: conversation.id,
        direction: 'outbound',
        content: response.message,
        intent_detected: intent,
        confidence_score: response.confidence,
      })

    // Return TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>${response.message}</Message>
      </Response>`

    return new Response(twiml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('Marcel webhook error:', error)
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Désolé, une erreur s'est produite. Veuillez réessayer ou appeler directement.</Message>
      </Response>`

    return new Response(errorTwiml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/xml',
      },
    })
  }
})

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase()

  // Booking intents
  if (lowerMessage.includes('rendez-vous') || lowerMessage.includes('appointment') || 
      lowerMessage.includes('rdv') || lowerMessage.includes('réserver')) {
    return 'booking_request'
  }

  // Service inquiry
  if (lowerMessage.includes('service') || lowerMessage.includes('prix') || 
      lowerMessage.includes('price') || lowerMessage.includes('combien')) {
    return 'service_inquiry'
  }

  // Availability check
  if (lowerMessage.includes('disponible') || lowerMessage.includes('available') || 
      lowerMessage.includes('horaire') || lowerMessage.includes('quand')) {
    return 'availability_check'
  }

  // Confirmation
  if (lowerMessage.includes('oui') || lowerMessage.includes('yes') || 
      lowerMessage.includes('confirme') || lowerMessage.includes('parfait')) {
    return 'confirmation'
  }

  // Cancellation
  if (lowerMessage.includes('annuler') || lowerMessage.includes('cancel')) {
    return 'cancellation'
  }

  // Greeting
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || 
      lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'greeting'
  }

  return 'unknown'
}

function extractEntities(message: string): Record<string, any> {
  const entities: Record<string, any> = {}
  const lowerMessage = message.toLowerCase()

  // Extract date
  const datePatterns = [
    /(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/,
    /(demain|tomorrow)/,
    /(aujourd'hui|today)/,
    /(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/,
  ]

  for (const pattern of datePatterns) {
    const match = lowerMessage.match(pattern)
    if (match) {
      entities.date = match[0]
      break
    }
  }

  // Extract time
  const timePattern = /(\d{1,2})[h:]?(\d{0,2})/
  const timeMatch = lowerMessage.match(timePattern)
  if (timeMatch) {
    entities.time = timeMatch[0]
  }

  // Extract service
  const services = ['coupe', 'barbe', 'rasage', 'coloration', 'haircut', 'beard', 'shave']
  for (const service of services) {
    if (lowerMessage.includes(service)) {
      entities.service = service
      break
    }
  }

  // Extract barbier name
  const barbierPattern = /(avec|with)\s+(\w+)/
  const barbierMatch = lowerMessage.match(barbierPattern)
  if (barbierMatch) {
    entities.barbier = barbierMatch[2]
  }

  return entities
}

async function generateResponse(
  supabase: any,
  conversation: any,
  intent: string,
  entities: Record<string, any>,
  originalMessage: string
): Promise<{ message: string; confidence: number }> {
  const lang = conversation.preferred_language || 'fr'
  const isRecognized = conversation.is_recognized_client
  const clientName = conversation.client_name

  switch (intent) {
    case 'greeting':
      if (isRecognized) {
        return {
          message: lang === 'fr' 
            ? `Bonjour ${clientName}! Content de vous revoir. Comment puis-je vous aider aujourd'hui?`
            : `Hello ${clientName}! Good to hear from you again. How can I help you today?`,
          confidence: 0.95,
        }
      }
      return {
        message: lang === 'fr'
          ? `Bonjour! Bienvenue chez Elite Barbershop. Je suis Marcel, votre assistant virtuel. Comment puis-je vous aider?`
          : `Hello! Welcome to Elite Barbershop. I'm Marcel, your virtual assistant. How can I help you?`,
        confidence: 0.95,
      }

    case 'booking_request':
      // Check for missing entities
      if (!entities.date || !entities.time) {
        return {
          message: lang === 'fr'
            ? `Pour réserver un rendez-vous, j'ai besoin de quelques informations. Quelle date et heure préférez-vous?`
            : `To book an appointment, I need some information. What date and time would you prefer?`,
          confidence: 0.90,
        }
      }

      // Check availability
      const { data: availability } = await supabase
        .from('v_appointment_availability')
        .select('*')
        .eq('date', entities.date)
        .eq('start_time', entities.time)
        .is('status', null)

      if (availability && availability.length > 0) {
        // Create appointment
        const { data: appointment } = await supabase
          .from('appointments')
          .insert({
            client_id: conversation.account_id,
            salon_id: availability[0].salon_id,
            barbier_id: entities.barbier ? availability[0].barbier_id : null,
            date: entities.date,
            start_time: entities.time,
            end_time: entities.time, // Calculate based on service
            services: [entities.service || 'coupe'],
            total_price: 45, // Calculate based on services
            booking_source: 'marcel_ai',
            marcel_conversation_id: conversation.id,
            status: 'confirmed',
          })
          .select()
          .single()

        // Update conversation
        await supabase
          .from('marcel_conversations')
          .update({
            conversion_achieved: true,
            booking_created_id: appointment.id,
          })
          .eq('id', conversation.id)

        return {
          message: lang === 'fr'
            ? `Parfait! J'ai réservé votre rendez-vous pour le ${entities.date} à ${entities.time}. Vous recevrez une confirmation par SMS.`
            : `Perfect! I've booked your appointment for ${entities.date} at ${entities.time}. You'll receive a confirmation via SMS.`,
          confidence: 0.95,
        }
      }

      return {
        message: lang === 'fr'
          ? `Désolé, ce créneau n'est pas disponible. Voulez-vous essayer un autre moment?`
          : `Sorry, that time slot is not available. Would you like to try another time?`,
        confidence: 0.85,
      }

    case 'service_inquiry':
      return {
        message: lang === 'fr'
          ? `Nos services: Coupe (35$), Barbe (20$), Coupe+Barbe (50$), Rasage traditionnel (35$). Que souhaitez-vous réserver?`
          : `Our services: Haircut ($35), Beard ($20), Haircut+Beard ($50), Traditional shave ($35). What would you like to book?`,
        confidence: 0.95,
      }

    case 'availability_check':
      const { data: slots } = await supabase
        .from('v_appointment_availability')
        .select('date, start_time')
        .is('status', null)
        .gte('date', new Date().toISOString().split('T')[0])
        .limit(5)

      if (slots && slots.length > 0) {
        const slotList = slots.map(s => `${s.date} à ${s.start_time}`).join(', ')
        return {
          message: lang === 'fr'
            ? `Voici nos prochaines disponibilités: ${slotList}. Lequel vous convient?`
            : `Here are our next available slots: ${slotList}. Which one works for you?`,
          confidence: 0.90,
        }
      }

      return {
        message: lang === 'fr'
          ? `Nous sommes très demandés cette semaine. Puis-je vous proposer la semaine prochaine?`
          : `We're fully booked this week. Can I offer you something next week?`,
        confidence: 0.85,
      }

    case 'cancellation':
      if (conversation.booking_created_id) {
        await supabase
          .from('appointments')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            cancellation_reason: 'Client request via Marcel',
          })
          .eq('id', conversation.booking_created_id)

        return {
          message: lang === 'fr'
            ? `Votre rendez-vous a été annulé. N'hésitez pas à me contacter pour reprogrammer.`
            : `Your appointment has been canceled. Feel free to contact me to reschedule.`,
          confidence: 0.95,
        }
      }

      return {
        message: lang === 'fr'
          ? `Je ne trouve pas de rendez-vous actif. Pouvez-vous me donner plus de détails?`
          : `I can't find an active appointment. Can you provide more details?`,
        confidence: 0.70,
      }

    default:
      return {
        message: lang === 'fr'
          ? `Je ne suis pas sûr de comprendre. Voulez-vous: 1) Prendre un RDV, 2) Connaître nos services, 3) Vérifier les disponibilités?`
          : `I'm not sure I understand. Would you like to: 1) Book an appointment, 2) Learn about services, 3) Check availability?`,
        confidence: 0.60,
      }
  }
}