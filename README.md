# AIgram

AIgram is a Telegram-style chat application that connects to OpenAI's API to provide AI-powered conversations. Each chat can take on a different AI role based on its name.

## 🔥 Features

- **Responsive UI** - Works seamlessly on both mobile and desktop
- **Multiple AI Chats** - Create different chats with unique AI personalities
- **Role-Based AI** - AI adapts its responses based on chat names
- **Real-time Typing Indicators** - See when the AI is "typing" a response
- **Chat Search** - Quickly find existing conversations
- **Custom Chat Names** - Name your chats to set the AI's role
- **Message History** - All conversations are saved locally
- **Clean, Modern UI** - Telegram-inspired interface with smooth animations

07.06.25
- **Dark mode feature added** - interface can be light, dark or correspond to the system settings

## 📱 Screenshots

[Screenshots would go here]

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/onlytenders/aigram.git
cd aigram/client/aigram-client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## ⚙️ Configuration

### OpenAI API Key

AIgram requires an OpenAI API key to function. You can enter it directly in the app:

1. After starting the app, click on the settings button.
2. Enter your OpenAI API key in the dialog.

To get an API key:
1. Create an account at [OpenAI](https://platform.openai.com/)
2. Navigate to API keys section
3. Create a new API key
4. Copy and paste it into the app's settings.

## 💻 Tech Stack

- React
- TypeScript
- Tailwind CSS
- Vite
- OpenAI API

## 🧠 How It Works

AIgram uses the chat name to determine the AI's role. For example:
- "Chef Bot" will respond as a chef
- "Travel Guide" will give travel advice
- "Philosopher" will respond with philosophical insights

## 📝 License

MIT

## 🙏 Acknowledgments

- Inspired by Telegram's UI
- Powered by OpenAI's API

## 🌐 Deployment

Check out the live version of AIgram [here](https://ai-gram-ashy.vercel.app/).
