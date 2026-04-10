const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

const send = (to, subject, html) =>
  transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html })

const orderConfirmHTML = (order) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
  <div style="background:#E8540A;padding:24px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">IronForge Hardware</h1>
  </div>
  <div style="padding:32px">
    <h2 style="color:#1C1916">Order Confirmed! 🎉</h2>
    <p style="color:#6B635A">Hi ${order.shipping.name}, your order has been placed successfully.</p>
    <div style="background:#F8F5F1;border-radius:12px;padding:20px;margin:20px 0">
      <p style="margin:0 0 8px;font-weight:bold;color:#1C1916">Order #${order.orderNumber}</p>
      ${order.items.map(i => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #E8E2DA">
          <span style="color:#1C1916">${i.name} × ${i.quantity}</span>
          <span style="font-weight:bold;color:#E8540A">AED ${(i.price * i.quantity).toFixed(2)}</span>
        </div>`).join('')}
      <div style="margin-top:12px;text-align:right">
        <strong style="font-size:18px;color:#1C1916">Total: AED ${order.total.toFixed(2)}</strong>
      </div>
    </div>
    <p style="color:#6B635A">Payment: <strong>${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</strong></p>
    <p style="color:#6B635A">Questions? WhatsApp: <a href="https://wa.me/971502165805" style="color:#E8540A">+971 50 216 5805</a></p>
  </div>
  <div style="background:#F2EDE7;padding:16px;text-align:center">
    <p style="margin:0;font-size:12px;color:#A09890">© 2025 IronForge Hardware LLC. Dubai, UAE.</p>
  </div>
</div>`

const statusUpdateHTML = (order, status) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#E8540A;padding:24px;text-align:center">
    <h1 style="color:#fff;margin:0">IronForge Hardware</h1>
  </div>
  <div style="padding:32px">
    <h2>Order Update — #${order.orderNumber}</h2>
    <p>Hi ${order.shipping.name},</p>
    <p>Your order status has been updated to: <strong style="color:#E8540A;text-transform:capitalize">${status.replace(/_/g,' ')}</strong></p>
    ${order.trackingNumber ? `<p>Tracking Number: <strong>${order.trackingNumber}</strong> via ${order.courierName}</p>` : ''}
    <p>Questions? <a href="https://wa.me/971502165805" style="color:#E8540A">Chat on WhatsApp</a></p>
  </div>
</div>`

module.exports = {
  sendOrderConfirmation: (order) =>
    send(order.guestEmail || order.shipping.email || '', `Order Confirmed — #${order.orderNumber}`, orderConfirmHTML(order)),
  sendStatusUpdate: (order, status, email) =>
    send(email, `Order ${status} — #${order.orderNumber}`, statusUpdateHTML(order, status)),
  sendWelcome: (user) =>
    send(user.email, 'Welcome to IronForge Hardware!', `
      <div style="font-family:Arial,sans-serif;padding:32px;max-width:600px">
        <h2 style="color:#E8540A">Welcome, ${user.name}! 🔧</h2>
        <p>Thank you for joining IronForge Hardware — Dubai's #1 online hardware store.</p>
        <p>Use code <strong>WELCOME10</strong> for 10% off your first order.</p>
      </div>`),
  sendPasswordReset: (user, link) =>
    send(user.email, 'Reset Your Password — IronForge', `
      <div style="font-family:Arial,sans-serif;padding:32px;max-width:600px">
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password. Valid for 1 hour.</p>
        <a href="${link}" style="background:#E8540A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Reset Password</a>
      </div>`),
}
