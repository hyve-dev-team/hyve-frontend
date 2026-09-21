import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      'process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN': JSON.stringify(
        env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || 'phc_skn48zECyWj9rThXqSsnbZNGGoRjc6JnMDoPgKC9hbYA'
      ),
      'process.env.NEXT_PUBLIC_POSTHOG_HOST': JSON.stringify(
        env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
      ),
      'process.env': {},
    },
  }
})
