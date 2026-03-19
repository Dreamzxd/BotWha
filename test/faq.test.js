import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReply, detectFaqIntent } from '../src/faq.js';

test('detecta intención de más información', () => {
  assert.equal(detectFaqIntent('¿Podrían darme más información del negocio?'), 'mas_informacion');
});

test('detecta intención de hablar con una persona', () => {
  assert.equal(detectFaqIntent('Hay alguien con quien pueda chatear?'), 'alguien_para_chatear');
});

test('devuelve fallback cuando no reconoce la intención', () => {
  const result = buildReply('Necesito ayuda con algo muy específico');
  assert.equal(result.intent, 'fallback');
  assert.match(result.reply, /Gracias por escribirnos/i);
});
