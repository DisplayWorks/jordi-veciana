import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback, useRef } from 'react'
import { client, ALL_PROJECTS_QUERY, SETTINGS_QUERY, getDesktopLayout, getMobileLayout } from '../lib/queries'
import Description from '../components/Description'
import MetaBlock from '../components/MetaBlock'
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

export default function ProjectPage({ projects, currentSlug, globalMail }) {
  const router = useRouter()
  const [mobile, setMobile] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const [dir, setDir] = useState('fwd')
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const index = projects.findIndex(p => p.slug === currentSlug)
  const project = projects[index]

  useEffect(() => {
    setIsTouch(('ontouchstart' in window) || navigator.maxTouchPoints > 0)
    const mq = window.matchMedia('(orientation: portrait)')
    setMobile(mq.matches)
    const h = e => setMobile(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  const navigate = useCallback((d) => {
    const next = index + d
    if (next < 0) router.push('/')
    else if (next >= projects.length) router.push('/')
    else router.push('/' + projects[next].slug)
  }, [index, projects, router])

  useEffect(() => {
    const h = e => {
      if (e.key === 'ArrowRight') navigate(1)
      if (e.key === 'ArrowLeft')  navigate(-1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [navigate])

  if (!project) return null

  const layout      = getDesktopLayout(project.images)
  const leftNum     = fmt((index + 1) * 2 + 1)
  const rightNum    = fmt((index + 1) * 2 + 2)
  const inquiryMail = project.inquiry || globalMail || 'mail@jordiveciana.com'
  const mobileImg   = project.mobileImage?.src ? project.mobileImage : project.images?.[0]
  const hasImage    = mobileImg?.src

  function handleDesktopClick(e) {
    if (e.target.closest('a')) return
    const rect = e.currentTarget.getBoundingClientRect()
    navigate(e.clientX - rect.left < rect.width / 2 ? -1 : 1)
  }

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    setDir(e.clientX - rect.left < rect.width / 2 ? 'bck' : 'fwd')
  }

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

  const cursorUrl = dir === 'bck' ? '/cursor-bck.svg' : '/cursor-fwd.svg'
  const cursorFallback = dir === 'bck' ? 'w-resize' : 'e-resize'

  const prevProject = projects[(index - 1 + projects.length) % projects.length]
  const nextProject = projects[(index + 1) % projects.length]
  const preloadSrcs = [
    ...(prevProject?.images?.map(i => i.src) || []),
    ...(nextProject?.images?.map(i => i.src) || []),
  ].filter(Boolean)

  if (!mobile) return (
    <>
      <Head>
        {preloadSrcs.map(src => <link key={src} rel="preload" as="image" href={src} />)}
      </Head>
    <div
      className={styles.desktopWrapper}
      style={{ cursor: `url('${cursorUrl}') 8 8, ${cursorFallback}` }}
      onClick={handleDesktopClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setDir('fwd')}
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
      <Footer leftNum={leftNum} rightNum={rightNum} category={project.category} inquiryMail={inquiryMail} />
    </div>
    </>
  )

  return (
    <div className={styles.mobileWrapper} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className={`${styles.tapZone} ${styles.tapZoneLeft}`}  onClick={() => navigate(-1)} />
      <div className={`${styles.tapZone} ${styles.tapZoneRight}`} onClick={() => navigate(1)}  />
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {hasImage && (
          <div className={styles.mobileImgContainer}>
            <img src={mobileImg.src} alt="" />
          </div>
        )}
        <p className={styles.mobileTitle}>{project.title}</p>
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

export async function getStaticProps({ params }) {
  const [projects, settings] = await Promise.all([
    client.fetch(ALL_PROJECTS_QUERY),
    client.fetch(SETTINGS_QUERY),
  ])
  return {
    props: {
      projects,
      currentSlug: params.slug,
      globalMail: settings?.inquiryEmail || 'mail@jordiveciana.com',
    },
    revalidate: 60,
  }
}

export async function getStaticPaths() {
  const projects = await client.fetch(ALL_PROJECTS_QUERY)
  return {
    paths: projects.map(p => ({ params: { slug: p.slug } })),
    fallback: false,
  }
}
