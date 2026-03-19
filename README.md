# BotWha

MVP de bot para responder preguntas frecuentes de clientes que llegan desde anuncios de Facebook a WhatsApp Business.

## Qué hace

Este bot responde automáticamente preguntas como:

- "¿Podrían darme más información del negocio?"
- "¿Hay alguien con quien pueda chatear?"
- "¿Podrían contarme algo más sobre el anuncio?"
- Horarios, ubicación y precios.

## Requisitos

- Node.js 20+
- Una app de WhatsApp Business Cloud API en Meta
- Un endpoint público para registrar el webhook

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

## Variables de entorno

Personaliza el negocio editando `.env`:

- `BUSINESS_NAME`
- `BUSINESS_DESCRIPTION`
- `ADVISOR_LABEL`
- `ADVISOR_HOURS`
- `AD_SUMMARY`
- `CALL_TO_ACTION`
- `BUSINESS_HOURS`
- `BUSINESS_LOCATION`
- `BUSINESS_PRICING`

## Endpoints

- `GET /health`: revisión rápida.
- `GET /webhook`: validación del webhook de Meta.
- `POST /webhook`: recepción de mensajes entrantes.

## Flujo recomendado

1. El cliente llega desde un anuncio y envía un mensaje.
2. Meta llama a `POST /webhook`.
3. El bot detecta la intención con reglas simples.
4. El bot responde con un mensaje acorde a la FAQ.
5. Si el usuario quiere atención humana, el bot lo indica y puedes conectar una derivación real después.

## Próximos pasos sugeridos

- Guardar conversaciones en una base de datos.
- Derivar a un asesor real cuando detecte intención de compra.
- Agregar plantillas por campaña o por anuncio.
- Conectar IA para respuestas más abiertas.

## Ejemplo de personalización

Si vendes servicios dentales, puedes usar algo así:

- `BUSINESS_NAME=Clínica Sonrisa`
- `BUSINESS_DESCRIPTION=Ofrecemos limpiezas, ortodoncia y evaluación dental con atención personalizada.`
- `AD_SUMMARY=En el anuncio mostramos nuestras promociones y tratamientos disponibles.`
- `BUSINESS_PRICING=la evaluación inicial tiene un costo promocional y el tratamiento depende del diagnóstico`
