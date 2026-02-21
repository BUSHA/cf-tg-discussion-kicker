# TG Discussion kicker 🛡️

A lightweight, serverless Telegram bot built for **Cloudflare Workers**. It automatically manages Telegram Channel Discussion Groups to ensure they remain dedicated "comment repositories" rather than public chatrooms.

## 🛑 The problem
When you link a group to a Telegram Channel to host comments, that group becomes publicly discoverable. Telegram currently offers **no native setting** to allow users to comment on posts while preventing them from joining the group as a member.

This leads to:
* **Chatter overload:** Users treating your comment storage like a public chat.
* **Service message clutter:** Dozens of "User joined" and "User left" notifications breaking the flow of comments.

## ✨ The solution
**TG Discussion kicker** acts as a silent gatekeeper:
1.  **Strict removal:** Every user who joins the group directly is instantly kicked. **The only exception is the ID defined in `ADMIN_ID`**, ensuring you (the owner) can never be accidentally locked out.
2.  **Ghost mode:** The bot immediately deletes the "User joined" and "User left" system messages.
3.  **Kick-not-ban Logic:** It uses a `ban` + `unban` cycle. This removes the user but doesn't add them to the permanent "Blacklist," allowing them to still view and post comments.
5.  **Real-time logs:** Notifies you via private DM whenever a user is removed, including their Name, ID, and Username.

## 🛠 Setup

### 1. Bot configuration
1.  Create a bot via [@BotFather](https://t.me/botfather) and save the **API Token**.
2.  Get your numerical User ID via [@userinfobot](https://t.me/userinfobot).
3.  Add the bot to your Discussion Group as an **Administrator**.
4.  **Crucial Permissions:** Ensure "Delete Messages" and "Ban Users" are enabled.

### 2. Cloudflare deployment
1.  Create a new **Cloudflare worker**.
2.  Paste the `worker.js` code from this repository.
3.  Go to **Settings > Variables** and add the following:
    * `BOT_TOKEN`: Your Telegram API Token.
    * `ADMIN_ID`: Your numerical Telegram ID (for receiving kick logs).
4.  **Save and deploy.**

### 3. Set webhook
Visit the following URL in your browser (replace with your details):
`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>`

## 🔒 Environment variables
| Variable | Description |
| :--- | :--- |
| `BOT_TOKEN` | Your Telegram Bot API Token. |
| `ADMIN_ID` | Your personal Telegram User ID for notifications. |

## ⚙️ How It Works (Technical)
The bot uses a **Ban and Unban** sequence. In the Telegram API, a "kick" doesn't exist as a single command—you must `banChatMember`. However, a ban adds a user to the restricted list permanently. By immediately calling `unbanChatMember`, the bot removes the user from the group but keeps the "Blacklist" empty, ensuring your group settings stay clean and users can still comment.

## 📄 License
MIT
