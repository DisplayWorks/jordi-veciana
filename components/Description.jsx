export default function Description({ description }) {
  if (!description || !description.length) return null
  return (
    <div>
      {description.map((block, i) => {
        if (!block.children) return null
        const content = block.children.map((span, j) => {
          const mark = span.marks?.[0]
          const markDef = mark ? block.markDefs?.find(m => m._key === mark) : null
          if (markDef?.href) {
            return (
              <a key={j} href={markDef.href} target="_blank" rel="noreferrer"
                 style={{ color: 'inherit', textDecoration: 'none' }}
                 onMouseOver={e => e.target.style.color='#923b25'}
                 onMouseOut={e => e.target.style.color='inherit'}>
                {span.text}
              </a>
            )
          }
          return <span key={j}>{span.text}</span>
        })
        return (
          <p key={i} style={{ textIndent: i === 0 ? '0' : '24px', margin: 0 }}>
            {content}
          </p>
        )
      })}
    </div>
  )
}
