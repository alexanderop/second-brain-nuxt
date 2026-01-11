/**
 * OG Image markup generation utilities
 *
 * Pure functions for creating Satori-compatible markup for OG images.
 * Extracted for testability following the FC/IS pattern.
 */

// Satori element type
export interface SatoriElement {
  type: string
  props: {
    style?: Record<string, unknown>
    children?: (SatoriElement | string)[] | SatoriElement | string
    [key: string]: unknown
  }
}

export const TYPE_ICONS: Record<string, string> = {
  book: '📚',
  podcast: '🎙️',
  newsletter: '📰',
  article: '📄',
  note: '📝',
  til: '💡',
  moc: '🗺️',
  tweet: '🐦',
  video: '🎬',
}

/**
 * Truncates a description to a maximum length with ellipsis
 */
export function truncateDescription(description: string, maxLength: number = 120): string {
  if (description.length <= maxLength) return description
  return `${description.slice(0, maxLength)}...`
}

/**
 * Gets the icon for a content type, with fallback to note icon
 */
export function getTypeIcon(type: string): string {
  return TYPE_ICONS[type] || '📝'
}

/**
 * Creates Satori-compatible markup for an OG image
 *
 * @param title - The page title
 * @param description - The page description/summary
 * @param type - The content type (book, podcast, note, etc.)
 * @param siteName - The site name for branding
 * @returns SatoriElement tree for rendering
 */
export function createOgImageMarkup(
  title: string,
  description: string,
  type: string,
  siteName: string,
): SatoriElement {
  const icon = getTypeIcon(type)
  const truncatedDescription = truncateDescription(description)

  return {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      },
      children: [
        // Top accent bar
        {
          type: 'div',
          props: {
            style: {
              height: '8px',
              width: '100%',
              background: 'linear-gradient(90deg, #e94560 0%, #ff6b6b 100%)',
            },
          },
        },
        // Main content
        {
          type: 'div',
          props: {
            style: {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '64px',
            },
            children: [
              // Type badge
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 16px',
                          borderRadius: '9999px',
                          background: 'rgba(233, 69, 96, 0.2)',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '28px', marginRight: '8px' },
                              children: icon,
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '20px',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: '#e94560',
                              },
                              children: type,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              // Title
              {
                type: 'div',
                props: {
                  style: {
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                  },
                  children: [
                    {
                      type: 'h1',
                      props: {
                        style: {
                          fontSize: '64px',
                          fontWeight: 700,
                          lineHeight: 1.2,
                          color: '#ffffff',
                        },
                        children: title,
                      },
                    },
                  ],
                },
              },
              // Description (conditionally included)
              ...(truncatedDescription
                ? [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', marginBottom: '32px' },
                        children: {
                          type: 'p',
                          props: {
                            style: {
                              fontSize: '24px',
                              lineHeight: 1.5,
                              color: 'rgba(255, 255, 255, 0.7)',
                            },
                            children: truncatedDescription,
                          },
                        },
                      },
                    },
                  ]
                : []),
              // Footer
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                width: '48px',
                                height: '48px',
                                borderRadius: '9999px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '16px',
                                background: 'rgba(233, 69, 96, 0.3)',
                              },
                              children: [
                                {
                                  type: 'span',
                                  props: {
                                    style: { fontSize: '24px' },
                                    children: '🧠',
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '24px',
                                fontWeight: 600,
                                color: 'rgba(255, 255, 255, 0.9)',
                              },
                              children: siteName,
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '18px',
                          color: 'rgba(255, 255, 255, 0.5)',
                        },
                        children: 'second-brain.dev',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  }
}
