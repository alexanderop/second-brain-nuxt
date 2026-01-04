# Newsletter Profile Creation

Auto-created when adding an article to a new newsletter.

## Location

`content/newsletters/{slug}.md`

## Schema

```yaml
---
name: "Newsletter Name"
slug: "newsletter-slug"
description: "Tagline or about text"
logo: "https://..."                  # Square-ish logo image URL
website: "https://..."               # Newsletter homepage
authors:
  - author-slug
platform: substack                   # Optional: substack, beehiiv, ghost, convertkit, buttondown, revue, mailchimp, other
topics:                              # Optional: main topics covered
  - topic-1
  - topic-2
---
```

## Slug Generation

- Lowercase, kebab-case
- Remove "newsletter", "weekly", "daily" suffixes unless distinctive
- Keep distinctive brand name
- Examples:
  - "Lenny's Newsletter" → `lennys-newsletter`
  - "The Pragmatic Engineer" → `pragmatic-engineer`
  - "Dense Discovery" → `dense-discovery`
  - "Morning Brew" → `morning-brew`

## Platform Detection

| Platform | Signals |
|----------|---------|
| Substack | Domain contains `substack.com`, meta tags with "substack" |
| beehiiv | Domain contains `beehiiv.com`, beehiiv meta tags |
| Ghost | `/ghost/` in page source, Ghost meta tags |
| ConvertKit | `convertkit.com` domain, ConvertKit branding |
| Buttondown | `buttondown.email` domain |

## Quality Checklist

Before saving profile:
- [ ] Name matches publication branding
- [ ] Logo is square-ish, not article thumbnail
- [ ] At least one author linked
- [ ] Website URL is newsletter homepage (not article)
- [ ] Platform correctly detected

## Example Profiles

### Substack Newsletter

```yaml
---
name: "Lenny's Newsletter"
slug: "lennys-newsletter"
description: "Advice for building product, driving growth, and accelerating your career"
logo: "https://substackcdn.com/image/fetch/w_256,c_limit,f_auto,q_auto:good,fl_progressive:steep/..."
website: "https://www.lennysnewsletter.com"
authors:
  - lenny-rachitsky
platform: substack
topics:
  - product-management
  - growth
  - startup
---
```

### Custom Domain Newsletter

```yaml
---
name: "The Pragmatic Engineer"
slug: "pragmatic-engineer"
description: "Big Tech and high-growth startups, from the inside"
logo: "https://substackcdn.com/image/fetch/w_256..."
website: "https://newsletter.pragmaticengineer.com"
authors:
  - gergely-orosz
platform: substack
topics:
  - software-engineering
  - tech-industry
  - career
---
```
