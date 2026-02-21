export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("OK");

    const API_URL = `https://api.telegram.org/bot${env.BOT_TOKEN}`;

    try {
      const update = await request.json();
      const msg = update.message;
      if (!msg) return new Response("OK");

      const chatId = msg.chat.id;
      const messageId = msg.message_id;

      if (msg.new_chat_members) {
        // Delete the join message
        await deleteMessage(API_URL, chatId, messageId);

        for (const member of msg.new_chat_members) {
          // SAFETY: Never kick the main admin/owner
          if (member.id.toString() === env.ADMIN_ID?.toString()) {
            continue;
          }

          // Kick others
          await kickUser(API_URL, chatId, member.id);
          
          const name = member.first_name + (member.last_name ? ` ${member.last_name}` : "");
          const username = member.username ? ` (@${member.username})` : "";
          
          const logMsg = `🚫 **User has been kicked**\n` +
                         `**Name:** ${name}${username}\n` +
                         `**ID:** \`${member.id}\`\n` +
                         `**Group:** ${msg.chat.title || "Unknown"}`;
          
          await notifyAdmin(API_URL, env.ADMIN_ID, logMsg);
        }
      }

      if (msg.left_chat_member) {
        await deleteMessage(API_URL, chatId, messageId);
      }

    } catch (e) {
      console.error("Worker Error:", e);
    }

    return new Response("OK", { status: 200 });
  },
};

// --- Helpers ---

async function notifyAdmin(apiUrl, adminId, text) {
  return fetch(`${apiUrl}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      chat_id: adminId, 
      text: text, 
      parse_mode: "Markdown" 
    })
  });
}

async function deleteMessage(apiUrl, chatId, messageId) {
  return fetch(`${apiUrl}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId })
  });
}

async function kickUser(apiUrl, chatId, userId) {
  await fetch(`${apiUrl}/banChatMember`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, user_id: userId })
  });
  await fetch(`${apiUrl}/unbanChatMember`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, user_id: userId })
  });
}