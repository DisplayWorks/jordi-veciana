import Head from 'next/head'
import { useRouter } from 'next/router'
import { client, ALL_PROJECTS_QUERY, SETTINGS_QUERY } from '../lib/queries'
import { useEffect, useState } from 'react'

const CATEGORIES = 'Architecture\nLighting\nInterior Design\nProducts'

export default function Home({ projects, ogImageSrc, coverName, coverSubtitle, coverCategories }) {
  const router = useRouter()
  const [layout, setLayout] = useState('desktop')

  useEffect(() => {
    const detect = () => {
      const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0
      const isPortrait = window.matchMedia('(orientation: portrait)').matches
      if (isTouch && isPortrait) setLayout('mobile')
      else if (isTouch) setLayout('tablet')
      else setLayout('desktop')
    }
    detect()
    const mq = window.matchMedia('(orientation: portrait)')
    mq.addEventListener('change', detect)
    return () => mq.removeEventListener('change', detect)
  }, [])

  const goToFirst = () => {
    if (projects.length > 0) router.push('/' + projects[0].slug)
  }

  const ogImage = ogImageSrc || 'https://jordi-veciana.vercel.app/og-default.jpg'

  return (
    <>
      <Head>
        <title>Jordi Veciana — Selected Works</title>
        <meta property="og:title" content="Jordi Veciana — Selected Works 2018-2026" />
        <meta property="og:description" content="Architecture, Lighting, Interior Design, Products" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Head>
      <div
        onClick={goToFirst}
        onTouchEnd={() => goToFirst()}
        style={{
          width: '100%', height: '100dvh', padding: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
          cursor: "url('/cursor-fwd.svg') 8 8, e-resize",
          fontFamily: "'Monument Grotesk', sans-serif", fontSize: '15px',
          lineHeight: 'normal', WebkitFontSmoothing: 'antialiased', background: '#fff',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', width: '100%' }}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <p>{coverName || 'Jordi Veciana'}</p>
            <p>{coverSubtitle || 'Selected Works 2018 — 2026'}</p>
          </div>
          <div style={{ display: 'flex', width: '100%' }}>
            <div style={{ flex: '1 0 0' }} />
            <div style={{ flex: '1 0 0', whiteSpace: 'pre-line' }}>{coverCategories || CATEGORIES}</div>
          </div>
          {layout === 'mobile' && (
            <div style={{ display: 'flex', width: '100%' }}>
              <div style={{ flex: '1 0 0' }} />
              <div style={{ flex: '1 0 0' }}>
                <img src="/cursor-fwd.svg" alt="" width="11" height="13" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const [projects, settings] = await Promise.all([
    client.fetch(ALL_PROJECTS_QUERY),
    client.fetch(SETTINGS_QUERY),
  ])
  return {
    props: {
      projects,
      globalMail: settings?.inquiryEmail || 'mail@jordiveciana.com',
      ogImageSrc: settings?.ogImageSrc || null,
      coverName: settings?.coverName || null,
      coverSubtitle: settings?.coverSubtitle || null,
      coverCategories: settings?.coverCategories || null,
    },
    revalidate: 60,
  }
}
