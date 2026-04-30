const ARCH = ['architecture', 'interior-design']
const PROD = ['lighting', 'product']

function LinkField({ data, label }) {
  if (!data?.text) return null
  // Label outside link, only value is linked, arrow non-breaking with last word
  const textParts = data.text.split(' ')
  const lastWord  = textParts.pop()
  const restText  = textParts.join(' ')

  const linkedContent = data.url ? (
    <a href={data.url} target="_blank" rel="noreferrer">
      {restText ? restText + ' ' : ''}
      <span style={{ whiteSpace: 'nowrap' }}>
        {lastWord}{data.showArrow && ' →'}
      </span>
    </a>
  ) : (
    <span>
      {data.text}
      {data.showArrow && <span style={{ whiteSpace: 'nowrap' }}> →</span>}
    </span>
  )

  return (
    <p style={{ margin: 0 }}>
      {label && <span>{label}: </span>}
      {linkedContent}
    </p>
  )
}

function PlainField({ label, value }) {
  if (!value) return null
  return <p style={{ margin: 0 }}>{label}: {value}</p>
}

function Gap() {
  return <span style={{ display: 'block', height: '1.2em' }} />
}

export default function MetaBlock({ project, inquiryMail }) {
  const {
    category, year, publication, manufacturer, material, technicalSheet,
    client, location,
    imprintPhotography, imprintGraphicDesign, imprintFonts,
    imprintPublishedBy, imprintCopyright,
  } = project
  const isArch    = ARCH.includes(category)
  const isProd    = PROD.includes(category)
  const isImprint = category === 'imprint'
  const mail      = inquiryMail || 'mail@jordiveciana.com'

  return (
    <div className="meta">
      {isArch && (
        <>
          <LinkField data={client}   label="Client"   />
          <LinkField data={location} label="Location" />
          <PlainField label="Year"   value={year}     />
          {publication?.text ? (
            <>
              <Gap />
              <p style={{ margin: 0 }}>
                <a href={publication.url} target="_blank" rel="noreferrer">
                  {publication.text}{publication.showArrow && <span style={{ whiteSpace: 'nowrap' }}> →</span>}
                </a>
              </p>
              <p style={{ margin: 0 }}><a href={'mailto:' + mail}>Inquiry</a></p>
            </>
          ) : (
            <><Gap /><p style={{ margin: 0 }}><a href={'mailto:' + mail}>Inquiry</a></p></>
          )}
        </>
      )}

      {isProd && (
        <>
          <LinkField  data={manufacturer} label="Manufacturer" />
          <PlainField label="Material"    value={material}     />
          <PlainField label="Year"        value={year}         />
          {technicalSheet ? (
            <>
              <Gap />
              <p style={{ margin: 0 }}>
                <a href={technicalSheet} target="_blank" rel="noreferrer">
                  <span style={{ whiteSpace: 'nowrap' }}>Technical Sheet →</span>
                </a>
              </p>
              <p style={{ margin: 0 }}><a href={'mailto:' + mail}>Inquiry</a></p>
            </>
          ) : (
            <><Gap /><p style={{ margin: 0 }}><a href={'mailto:' + mail}>Inquiry</a></p></>
          )}
        </>
      )}

      {isImprint && (
        <>
          <LinkField data={imprintPhotography}   label="Photography"    />
          <LinkField data={imprintGraphicDesign} label="Graphic Design" />
          <LinkField data={imprintFonts}         label="Fonts"          />
          {(imprintPublishedBy?.text || imprintAddress) && <Gap />}
          <LinkField data={imprintPublishedBy}   label="Published by"   />
          {imprintCopyright && <><Gap /><p style={{ margin: 0 }}>{imprintCopyright}</p></>}
        </>
      )}
    </div>
  )
}
