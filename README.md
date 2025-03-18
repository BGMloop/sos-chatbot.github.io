# SOS Chatbot

A powerful AI chatbot built with Next.js, LangChain, and IBM Watsonx.ai Engine.

## Features

- 🤖 Advanced AI capabilities powered by LangChain and IBM Watsonx.ai
- 🔐 Secure authentication with Clerk
- 💾 Real-time database with Convex
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design
- 🔄 Real-time chat with streaming responses
- 🛠️ Tool integration (web search, calculator, weather)
- 📝 Markdown support for messages
- 🔍 Advanced search capabilities

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: LangChain, IBM Watsonx.ai Engine
- **Authentication**: Clerk
- **Database**: Convex
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- IBM Watsonx.ai API key
- Clerk API keys
- Convex account and API keys

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sos-chatbot.github.io.git
cd sos-chatbot.github.io
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your API keys and configuration.

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
sos-chatbot.github.io/
├── app/                    # Next.js app directory
├── components/            # React components
├── lib/                   # Utility functions and shared code
├── public/               # Static assets
├── convex/               # Convex database schema and functions
├── docs/                 # Documentation
└── wxflows/              # IBM Watsonx.ai flows
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- IBM Watsonx.ai for providing the AI engine
- LangChain for the powerful LLM framework
- Clerk for authentication
- Convex for the real-time database
- The Next.js team for the amazing framework

# Custome Tool example to name them
wxflows import curl https://"".com
wxflows deploy

claude-3-7-sonnet-20250219