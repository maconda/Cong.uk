# Design Notes

## Project

Cong.uk is a quiet personal website for photography work, writing, video, and contact links. The interface should stay restrained, editorial, and content-first. New features should feel like part of the same personal site, not a separate product dashboard.

## Visual Direction

- Background: plain white.
- Text: black and dark neutral grays.
- Borders: thin, low-contrast gray.
- Shape: disciplined radii for framed content and controls.
- Motion: subtle opacity and color transitions only.
- Decoration: avoid gradients, decorative blobs, heavy shadows, and ornamental illustrations.

## Typography

The photography page uses an editorial serif identity and compact body copy. General interface text uses a neutral sans-serif stack so navigation and contact areas remain practical and legible.

- Identity and gallery headings: existing serif stack.
- Interface text: `Helvetica Neue`, Helvetica, Arial, system sans-serif.
- Body copy: compact, high legibility, no negative letter spacing.

## Layout

Desktop:

- Left sidebar remains fixed.
- Main content starts to the right of the sidebar.

Mobile:

- Sidebar becomes a compact top navigation.
- The page should not create horizontal overflow.

## Implementation Guidelines

- Source files live in `index.html`, `src/main.js`, and `src/styles.css`.
- `dist/`, `node_modules/`, logs, and environment files are generated or local-only and should not be committed.
- New sections should be added in small, scoped changes rather than broad layout rewrites.
