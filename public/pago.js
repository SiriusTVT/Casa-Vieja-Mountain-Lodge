const card = document.getElementById('payment-card');
const token = new URLSearchParams(window.location.search).get('token');

function text(value, fallback = 'Información pendiente de configurar') { return value || fallback; }

async function loadPayment() {
  if (!token) throw new Error('Link de pago inválido.');
  const response = await fetch(`/api/pagos/${encodeURIComponent(token)}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Este link de pago no está disponible.');
  const { payment } = data;
  const settings = payment.settings;
  card.innerHTML = `<h1>Completa tu pago</h1><p>Hola, <strong>${payment.name}</strong>. Esta es la información para confirmar tu experiencia en Casa Vieja.</p><p class="amount">${payment.amount}</p><p class="notice">Link válido hasta ${new Date(payment.expiresAt).toLocaleString('es-CO')}.</p><h2>Transferencia bancaria</h2><div class="method"><strong>${text(settings.bankName)}</strong>Tipo de cuenta: ${text(settings.accountType)}<br>Número: ${text(settings.accountNumber)}<br>Titular: ${text(settings.accountHolder)}</div><h2>Bre-B</h2><div class="method"><strong>Llave Bre-B</strong>${text(settings.brebKey)}</div>${settings.qrImageUrl ? `<h2>Pago con QR</h2><img class="qr" src="${settings.qrImageUrl}" alt="Código QR de pago">` : ''}<p class="notice">Después de pagar, conserva el comprobante y avisa al lodge por WhatsApp para validar la reserva.</p><button class="confirm" type="button">Ya realicé el pago</button><p class="status" role="status"></p>`;
  card.querySelector('.confirm').addEventListener('click', async () => { const status = card.querySelector('.status'); try { const result = await fetch(`/api/pagos/${encodeURIComponent(token)}`, { method: 'POST' }); if (!result.ok) throw new Error('No se pudo registrar el aviso.'); status.textContent = 'Aviso registrado. El lodge validará tu comprobante por WhatsApp.'; } catch (error) { status.textContent = error.message; } });
}

loadPayment().catch((error) => { card.innerHTML = `<h1>Link no disponible</h1><p class="notice">${error.message}</p>`; });
