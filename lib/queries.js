import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = createImageUrlBuilder(client)
export const urlFor = (source) => builder.image(source)

// Desktop layout derived from image count and orientation
export function getDesktopLayout(images) {
  if (!images || images.length === 0) return 0 // no images
  const count = images.length
  const ori = images[0].orientation || 'portrait'
  if (ori === 'portrait'  && count === 1) return 1
  if (ori === 'portrait'  && count === 2) return 2
  if (ori === 'landscape' && count === 1) return 3
  if (ori === 'landscape' && count === 2) return 4
  return 1
}

// Mobile layout from flagged image, fallback to first
export function getMobileLayout(mobileImage) {
  return mobileImage?.orientation === 'landscape' ? 2 : 1
}

export const SETTINGS_QUERY = `*[_type == "settings" && _id == "global-settings"][0] {
  inquiryEmail,
  "coverImage1Src": coverImage1.asset->url,
  "coverImage2Src": coverImage2.asset->url,
  coverVariant,
  coverVariant
}`

export const ALL_PROJECTS_QUERY = `*[_type == "project"] | order(orderRank) {
  _id,
  title,
  "slug": slug.current,
  category,
  description,
  year,
  inquiry,
  "images": images[] {
    isMobileImage,
    "src": image.asset->url,
    // Auto-detect orientation from asset metadata
    "orientation": select(
      image.asset->metadata.dimensions.aspectRatio > 1 => "landscape",
      "portrait"
    ),
  },
  // Mobile image: flagged one or fallback to first
  "mobileImage": select(
    count(images[isMobileImage == true]) > 0 => {
      "src": images[isMobileImage == true][0].image.asset->url,
      "orientation": select(
        images[isMobileImage == true][0].image.asset->metadata.dimensions.aspectRatio > 1 => "landscape",
        "portrait"
      ),
    },
    {
      "src": images[0].image.asset->url,
      "orientation": select(
        images[0].image.asset->metadata.dimensions.aspectRatio > 1 => "landscape",
        "portrait"
      ),
    }
  ),
  client,
  location,
  publication,
  manufacturer,
  material,
  "technicalSheet": technicalSheet.asset->url,
  imprintPhotography,
  imprintGraphicDesign,
  imprintFonts,
  imprintPublishedBy,
  imprintCopyright,
  noImageGap,
}`
