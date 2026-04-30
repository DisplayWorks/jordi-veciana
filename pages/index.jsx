import { useEffect, useState, useCallback, useRef } from 'react'
import { client, ALL_PROJECTS_QUERY, SETTINGS_QUERY, getDesktopLayout, getMobileLayout } from '../lib/queries'
import Description from '../components/Description'
import MetaBlock from '../components/MetaBlock'
import Head from "next/head"
import styles from '../styles/Magazine.module.css'

function fmt(n) { return String(n).padStart(2, '0') }

function Footer({ leftNum, rightNum, category, inquiryMail, isMobile }) {
  const label = {
    'architecture':'Architecture','interior-design':'Interior Design',
    'lighting':'Lighting','product':'Product',
    'editorial':'Editorial','imprint':'Imprint',
  }[category] || ''
  return (
    <div className={isMobile ? styles.mobileFooter : styles.desktopFooter}>
      <span className={styles.pageNum}>{leftNum}</span>
      <div className={styles.footerNav}>
        <a href={'mailto:' + inquiryMail} className={styles.footerLink}>Jordi Veciana</a>
        {!isMobile && <span>Selected Works</span>}
        <span>{label}</span>
      </div>
      <span className={styles.pageNum}>{rightNum}</span>
    </div>
  )
}

function ProjectImages({ images, layout, noGap }) {
  if (!layout || layout === 0) return null
  const hasGap = (layout === 2 || layout === 4) && !noGap
  return (
    <div className={`${styles.imgContainer}${hasGap ? ' ' + styles.gap : ''}`}>
      {images.map((img, i) => (
        <div key={i} className={`${styles.imgWrap} ${styles['img' + layout]}`}>
          <img src={img.src} alt="" />
        </div>
      ))}
    </div>
  )
}


const CATEGORIES = 'Architecture\nLighting\nInterior Design\nProducts'

function Cover({ onNext }) {
  return (
    <div
      onClick={onNext}
      style={{
        width: '100%',
        height: '100dvh',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        cursor: "url('/cursor-fwd.svg') 8 8, e-resize",
        fontFamily: "'Monument Grotesk', sans-serif",
        fontSize: '15px',
        lineHeight: 'normal',
        WebkitFontSmoothing: 'antialiased',
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', width: '100%' }}>
        {/* Title — centred */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <p>Jordi Veciana</p>
          <p>Selected Works 2018 — 2026</p>
        </div>
        {/* Categories — right half */}
        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ flex: '1 0 0' }} />
          <div style={{ flex: '1 0 0', whiteSpace: 'pre-line' }}>{CATEGORIES}</div>
        </div>

      </div>
    </div>
  )
}

export default function Magazine({ projects, globalMail }) {
  const [index, setIndex] = useState(-1)
  const [mobile, setMobile] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const [dir, setDir]       = useState('fwd')
  const [animKey, setAnimKey] = useState(0)
  const touchStartX         = useRef(null)
  const touchStartY         = useRef(null)

  useEffect(() => {
    try {
      const touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
      setIsTouch(touch)
      const portrait = window.matchMedia('(orientation: portrait)')
      setMobile(portrait.matches)
      const h = e => setMobile(e.matches)
      portrait.addEventListener('change', h)
      return () => portrait.removeEventListener('change', h)
    } catch(e) {
      console.error('media query error', e)
    }
  }, [])

  // Read hash after mount to avoid hydration mismatch
  useEffect(() => {
    const h = window.location.hash.match(/page=(\d+)/)
    if (h) {
      const n = parseInt(h[1], 10)
      setIndex(n === -1 ? -1 : Math.min(n, projects.length - 1))
    }
  }, [])

  // Sync hash + scroll reset on navigation
  useEffect(() => {
    window.history.replaceState(null, '', '#page=' + index)
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [index])

  const navigate = useCallback((d) => {
    setDir(d > 0 ? 'fwd' : 'bck')
    setAnimKey(k => k + 1)
    setIndex(i => {
      const next = i + d
      if (next < -1) return projects.length - 1
      if (next >= projects.length) return -1
      return next
    })
  }, [projects.length])

  useEffect(() => {
    const h = e => {
      if (e.key === 'ArrowRight') navigate(1)
      if (e.key === 'ArrowLeft')  navigate(-1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [navigate])

  if (!projects.length) return null

  /* Cover */
  if (index === -1) {
    return <Cover onNext={() => navigate(1)} />
  }

  const project     = projects[index]
  const layout      = getDesktopLayout(project.images)
  const mobileL     = getMobileLayout(project.mobileImage)
  const leftNum     = fmt(index * 2 + 1)
  const rightNum    = fmt(index * 2 + 2)
  const inquiryMail = project.inquiry || globalMail || 'mail@jordiveciana.com'
  const mobileImg   = project.mobileImage?.src ? project.mobileImage : project.images?.[0]

  /* Desktop — explicit click only, no auto, no animation */
  function handleDesktopClick(e) {
    if (e.target.closest('a')) return
    const rect = e.currentTarget.getBoundingClientRect()
    navigate(e.clientX - rect.left < rect.width / 2 ? -1 : 1)
  }

  function handleDesktopTouch(e) {
    if (e.target.closest('a')) return
    const touch = e.changedTouches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    navigate(touch.clientX - rect.left < rect.width / 2 ? -1 : 1)
  }

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    setDir(e.clientX - rect.left < rect.width / 2 ? 'bck' : 'fwd')
  }

  /* Mobile swipe */
  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) navigate(dx < 0 ? 1 : -1)
    touchStartX.current = null
    touchStartY.current = null
  }

  const cursorUrl      = dir === 'bck' ? '/cursor-bck.svg' : '/cursor-fwd.svg'
  const cursorFallback = dir === 'bck' ? 'w-resize' : 'e-resize'

  // Preload adjacent pages for instant navigation
  const prevIdx = (index - 1 + projects.length) % projects.length
  const nextIdx = (index + 1) % projects.length
  const preloadSrcs = [
    ...(projects[prevIdx]?.images?.map(i => i.src) || []),
    ...(projects[nextIdx]?.images?.map(i => i.src) || []),
  ].filter(Boolean)

  /* ── DESKTOP — no animation ── */
  if (!mobile) return (
    <>
      <Head>
        {preloadSrcs.map(src => (
          <link key={src} rel="preload" as="image" href={src} />
        ))}
      </Head>
    <div
      className={styles.desktopWrapper}
      style={{ cursor: `url('${cursorUrl}') 8 8, ${cursorFallback}`, touchAction: 'manipulation' }}
      onClick={handleDesktopClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setDir('fwd')}
      onTouchEnd={handleDesktopTouch}
    >
      <div className={styles.columns}>
        <div className={styles.col} /><div className={styles.col} />
        <div className={styles.col} /><div className={styles.col} />
        <div className={`${styles.col} ${styles.colName}`}><p>{project.title}</p></div>
        <div className={`${styles.col} ${styles.colText}`}>
          <Description description={project.description} />
          <MetaBlock project={project} inquiryMail={inquiryMail} />
        </div>
      </div>
      <ProjectImages images={project.images || []} layout={layout} noGap={project.noImageGap} />
      {isTouch && <><div onClick={() => navigate(-1)} style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", zIndex: 5 }} /><div onClick={() => navigate(1)} style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", zIndex: 5 }} /></>}      <Footer leftNum={leftNum} rightNum={rightNum} category={project.category} inquiryMail={inquiryMail} />
    </div>
    </>
  )

  /* ── MOBILE — slide animation ── */
  const animClass = dir === 'fwd' ? styles.animateInRight : styles.animateInLeft

  const hasImage = mobileImg?.src

  return (
    <div className={styles.mobileWrapper} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className={`${styles.tapZone} ${styles.tapZoneLeft}`}  onClick={() => navigate(-1)} />
      <div className={`${styles.tapZone} ${styles.tapZoneRight}`} onClick={() => navigate(1)}  />
      <div key={animKey} className={animClass} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Image — only if exists */}
        {hasImage && (
          <div className={styles.mobileImgContainer}>
            <img src={mobileImg.src} alt="" />
          </div>
        )}
        {/* Title */}
        <p className={styles.mobileTitle}>{project.title}</p>
        {/* Text col */}
        <div className={styles.mobileTextCol} style={{ flex: '1 0 0' }}>
          <Description description={project.description} />
          <MetaBlock project={project} inquiryMail={inquiryMail} />
          <div className={styles.mobileNav}>
            <button className={styles.navArrow} onClick={() => navigate(-1)}>
              <img src="/cursor-bck.svg" alt="" width="11" height="13" />
            </button>
            <button className={styles.navArrow} onClick={() => navigate(1)}>
              <img src="/cursor-fwd.svg" alt="" width="11" height="13" />
            </button>
          </div>
          <Footer leftNum={leftNum} rightNum={rightNum} category={project.category} inquiryMail={inquiryMail} isMobile />
        </div>
      </div>
    </div>
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
    },
    revalidate: 60,
  }
}
