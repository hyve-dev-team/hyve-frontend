import posthog from 'posthog-js'

const posthogToken =
  import.meta.env?.VITE_POSTHOG_PROJECT_TOKEN ||
  import.meta.env?.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
  'phc_skn48zECyWj9rThXqSsnbZNGGoRjc6JnMDoPgKC9hbYA'

const posthogHost =
  import.meta.env?.VITE_POSTHOG_HOST ||
  import.meta.env?.NEXT_PUBLIC_POSTHOG_HOST ||
  process.env.NEXT_PUBLIC_POSTHOG_HOST ||
  'https://us.i.posthog.com'

if (typeof window !== 'undefined' && posthogToken) {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    defaults: '2026-05-30',
    enable_recording_console_log: true,
  })
}

export default posthog
