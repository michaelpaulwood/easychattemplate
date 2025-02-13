# Easy Chat Template

Are you a developer looking to experiment with AI models or build your own AI chat application? This template is your perfect starting point!

## Why Choose This Template?

🚀 **Perfect for:**

- Developers exploring AI integration in web applications
- Startups building AI-powered chat products
- Engineers experimenting with different language models
- Teams needing a customizable chat interface
- Anyone wanting to learn AI integration with modern web tech

💡 **What Sets This Apart:**

- Zero-to-production in minutes, not days
- Production-ready, clean architecture
- Fully typed TypeScript codebase
- Modern stack: Next.js 13+, React, Tailwind CSS
- Built-in best practices for API key security
- Extensible design - add your own models easily

🛠️ **Real-World Use Cases:**

- Build your own ChatGPT-like interface
- Create specialized AI assistants
- Prototype AI features quickly
- Learn AI integration best practices
- Test different AI models in a real environment

This template provides everything you need to start building with AI, wrapped in a clean, modern, and customizable chat interface. Skip the boilerplate and focus on what matters - building your AI application.

## Features

- 🎨 Modern and responsive UI with dark/light mode support
- 🔒 Secure API key management (environment variables or browser storage)
- 🤖 Support for multiple OpenAI models (GPT-3.5-turbo, GPT-4)
- ⚡ Real-time chat interface with typing indicators
- 🎯 Built-in API key verification
- 📱 Mobile-friendly design
- 🔄 Message history with copy functionality
- ⚙️ User settings management
- 🎨 Tailwind CSS for styling
- 📝 TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. Clone this repository:

```bash
git clone https://github.com/yourusername/easychattemplate.git
cd easychattemplate
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory:

```env
# Required: Your OpenAI API key
OPENAI_API_KEY=your_api_key_here

# Optional: Default model (defaults to gpt-3.5-turbo if not set)
DEFAULT_MODEL=gpt-3.5-turbo
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Environment Variables

- `OPENAI_API_KEY` (optional): Your OpenAI API key. If provided, it will be used as the default API key.
- `DEFAULT_MODEL` (optional): The default model to use. Options: `gpt-3.5-turbo`, `gpt-4`

### API Key Management

You can provide the API key in two ways:

1. Environment variable (recommended for production)
2. Browser storage (user can input via settings)

### Models Configuration

The template supports two models out of the box:

- GPT-3.5 Turbo: Fast and cost-effective
- GPT-4: More capable but more expensive

You can modify the available models in `src/components/SettingsModal.tsx`.

## Customization

### Styling

The template uses Tailwind CSS for styling. Main style files:

- `src/app/globals.css`: Global styles
- `tailwind.config.ts`: Tailwind configuration

### Components

Key components you might want to customize:

- `src/components/ChatInterface.tsx`: Main chat interface
- `src/components/MessageInput.tsx`: Message input component
- `src/components/SettingsModal.tsx`: Settings modal

### API Routes

API endpoints are located in `src/app/api/`:

- `chat/route.ts`: Handles chat messages
- `check-api-key/route.ts`: Verifies API keys

## Security Considerations

1. Never commit your `.env` file
2. Use environment variables for API keys in production
3. Implement rate limiting for API routes
4. Add authentication if needed

## Browser Support

The template supports all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
