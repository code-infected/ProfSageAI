import '../styles/globals.css'

export const metadata = {
  title: 'ProfSageAI',
  description: 'AI-powered assistant for Rate My Professor',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}