const FAQ_RULES = [
  {
    id: 'mas_informacion',
    patterns: [
      /mas informacion/i,
      /m[aá]s informaci[oó]n/i,
      /me das info/i,
      /quiero info/i,
      /informacion del negocio/i,
      /info del negocio/i,
      /podr[ií]an darme m[aá]s informaci[oó]n/i,
      /de qu[eé] trata/i
    ],
    response: ({ businessName, businessDescription, advisorLabel }) =>
      `¡Hola! 👋 Gracias por escribir a ${businessName}. ${businessDescription}\n\nSi quieres, puedo ayudarte con información general, horarios, ubicación, precios base y cómo avanzar con tu consulta. También puedo pasarte con ${advisorLabel}.`
  },
  {
    id: 'alguien_para_chatear',
    patterns: [
      /hay alguien con quien pueda chatear/i,
      /quiero hablar con alguien/i,
      /me puede atender una persona/i,
      /asesor/i,
      /humano/i,
      /agente/i,
      /ejecutivo/i
    ],
    response: ({ advisorLabel, advisorHours }) =>
      `Sí, claro 😊 Puedo ayudarte ahora mismo con respuestas rápidas, y si prefieres atención personal te puedo derivar con ${advisorLabel}. Horario de atención: ${advisorHours}.`
  },
  {
    id: 'mas_sobre_anuncio',
    patterns: [
      /cu[eé]ntenme algo m[aá]s sobre el anuncio/i,
      /algo m[aá]s sobre el anuncio/i,
      /m[aá]s sobre el anuncio/i,
      /vi su anuncio/i,
      /vengo del anuncio/i,
      /informacion del anuncio/i
    ],
    response: ({ adSummary, callToAction }) =>
      `¡Claro! 📣 ${adSummary}\n\nSi te interesa, el siguiente paso es ${callToAction}. Si me dices qué te interesa exactamente, te doy una respuesta más precisa.`
  },
  {
    id: 'horarios',
    patterns: [/horario/i, /horarios/i, /a qu[eé] hora/i, /atienden/i],
    response: ({ hours }) => `Nuestro horario es: ${hours}.`
  },
  {
    id: 'ubicacion',
    patterns: [/ubicaci[oó]n/i, /d[oó]nde est[aá]n/i, /direccion/i, /direcci[oó]n/i],
    response: ({ location }) => `Estamos ubicados en ${location}. Si quieres, también puedo compartirte referencias para llegar.`
  },
  {
    id: 'precios',
    patterns: [/precio/i, /costos/i, /cu[aá]nto cuesta/i, /valor/i],
    response: ({ pricing }) => `Te comparto una referencia de precios: ${pricing}. Si me dices qué servicio o producto buscas, te doy un rango más exacto.`
  }
];

export const defaultBusinessConfig = {
  businessName: 'nuestro negocio',
  businessDescription: 'Somos un negocio que responde consultas frecuentes de clientes interesados en nuestros anuncios.',
  advisorLabel: 'un asesor',
  advisorHours: 'lunes a viernes de 9:00 a 18:00',
  adSummary: 'El anuncio muestra nuestra propuesta principal y cómo podemos ayudarte según tu necesidad.',
  callToAction: 'contarme qué producto o servicio te interesa para darte detalles',
  hours: 'lunes a viernes de 9:00 a 18:00',
  location: 'tu ciudad y dirección comercial',
  pricing: 'los precios varían según el servicio o producto solicitado'
};

export function detectFaqIntent(messageText = '') {
  const normalized = messageText.trim();

  for (const rule of FAQ_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      return rule.id;
    }
  }

  return 'fallback';
}

export function buildReply(messageText, config = defaultBusinessConfig) {
  const intent = detectFaqIntent(messageText);
  const rule = FAQ_RULES.find((item) => item.id === intent);

  if (!rule) {
    return {
      intent,
      reply: `¡Gracias por escribirnos! 👋 Cuéntame qué información necesitas y con gusto te ayudo. También puedo darte detalles sobre horarios, ubicación, precios o derivarte con ${config.advisorLabel}.`
    };
  }

  return {
    intent,
    reply: rule.response({ ...defaultBusinessConfig, ...config })
  };
}
