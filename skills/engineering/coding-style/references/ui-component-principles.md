# UI component principles

Minimum requirements a component must meet before it ships, written so they carry over to another chatbot frontend. Values in brackets are the ones this project uses; another project swaps in its own tokens, but keeps the rule. Project-specific look (colours, fonts, radius) stays in the design guide, not here.

## Rules for every component

- Colours, radius, shadows and fonts come from design tokens only. No literal hex, `rgb()` or arbitrary values in a component.
- Every visible string, `aria-label` and tooltip comes from the translation files. Layouts must fit a language about 20% longer than English, so text containers and buttons never get a fixed width.
- Light and dark mode ship together. Look at both, at a phone width (375px) and a desktop width (1280px), in every UI language.
- Every interactive element has a visible keyboard focus and a real role: a button is a `<button>`, a link is a link.
- Frequent actions (send, typing, toggles) get no animation. Menus, dialogs and drawers may animate `transform`, `opacity` and colour only, 150 to 250ms.
- When two utility classes set the same CSS property, the order of the generated stylesheet wins, not the order in `className`. Never pass `hidden` and a display class (`flex`, `inline-flex`) to the same element, and never stack two radius or font-size classes. Put responsive visibility on a wrapper element instead.
- Ship the component with tests for its main behaviours. The test names should describe each case.

## Conversation sidebar

### List

- Conversations sort newest first under a small muted label. Only the list scrolls; the logo, primary action and footer stay fixed.
- The footer, above a `--border` rule, is one row: the name's first letter in a 36px `--accent` circle, the name (truncated), and a settings icon button at the right (`SettingsMenu`). It opens a raised menu placed like the conversation menu (`useAnchoredMenu`: right of the button, flipping left or shifting up when there is no room) with four items: the Dashboard link first, the other UI language, the theme switch (labelled with the theme it switches to, "Dark" / "Light"), and "Switch name" with a log-out icon. Language and theme keep the menu open so the change is visible; Escape, a press outside, scroll or resize close it. The visitor's city and weather are not in the sidebar: from the desktop breakpoint [1024px] the location chip (`HeaderLocation` in `LocationBanner.tsx`, the weather chip look with a 16px `map-pin`, one line, truncated) sits at the right of the page header on HomePage (left of "New trip") and ChatPage (right of the conversation title); below it the chip sits at the right of the mobile top bar. It renders nothing (no gap left behind) while the location loads, when the IP lookup fails, or when the backend cannot name the city.
- The list has no tabs and no separate "New chat" button: the one primary "start" action at the top of the sidebar always opens an empty chat.
- Below the desktop breakpoint [1024px] the sidebar becomes a drawer over a dimmed backdrop and closes when a row is clicked.

### Row

- The title sits on one line and truncates with an ellipsis. The full title goes in the `title` attribute, and a conversation with no title shows a translated "Untitled" fallback.
- No leading icon. Minimum height [44px] and padding [8px 12px].
- The open conversation has the active fill [`--accent`]. Hover uses the same fill.
- The right side of the row has padding [44px] reserved for the action button, so the title never runs under it.

### Action button

- A vertical ellipsis icon button [36px] sits at the right edge of the row and is centred vertically.
- It shows on row hover, on keyboard focus and while its menu is open, and it is always visible on touch screens (`pointer: coarse`).
- Its `aria-label` includes the conversation title ("Actions for <title>"), and `aria-expanded` reflects the menu state.
- Hovering the button or having its menu open keeps the whole row highlighted. Put the hover on the list item (`group`), not on the link.

### Action menu

- The menu renders in a portal on `document.body` with fixed positioning, so the sidebar's scroll area cannot clip it.
- It opens to the right of the button with the top edges aligned and a [4px] gap. When the viewport has no room on the right it flips to the left, and it stays at least [8px] inside the viewport on every side.
- Measure before showing: render the menu invisible, compute the position in a layout effect, then show it. This avoids a flash at the wrong spot.
- It closes on a pointer press outside the menu and button, on Escape, on any scroll (capture phase) and on resize.
- Keep it compact: [4px] padding, [32px] items, the raised shadow.
- Content, top to bottom: the last update time as `HH:MM DD/MM/YYYY` in the product's time zone [Asia/Ho_Chi_Minh] as a 12px muted line above a divider, then Rename, then Delete in the destructive colour. There is no "Updated" label.

### Rename

- Rename opens the same dialog component as the delete confirm, not inline editing in the row.
- The dialog has a labelled text field prefilled with the current title and selected on open. Focus goes to the field, not to Cancel.
- The content is a `<form>`, so Enter saves. The save button uses the primary style ("Save name").
- Save is disabled when the trimmed value is empty. The field's `maxLength` equals the server limit [80].
- A server error shows under the field, and the dialog stays open.
- The server trims and NFC-normalizes the title, accepts 1 to the limit characters, and otherwise returns 422 (`PATCH /conversations/{id}` with `{title}`). A rename does not change `updated_at`, so it does not reorder the list.
- On success, write the new title into both the list cache and the detail cache. No refetch flash.

### Delete

- Delete always goes through a confirm dialog. The dialog names the conversation and says that its messages are deleted and cannot be recovered; the confirm button uses the destructive style.
- The server answers `DELETE /conversations/{id}` with 204. It deletes the conversation with its messages and the research saved for it; trips are not linked to a conversation and stay, and logged AI calls keep their row with the conversation cleared.
- On success, remove the row from the list cache and drop the detail cache.
- If the deleted conversation is the one open, navigate to an empty new chat.

### Tests

- The menu shows the formatted update time.
- Renaming through the dialog updates the row title.
- Cancelling the rename keeps the old title.
- Deleting the open conversation navigates to a new chat.

## Chat input (composer)

### Layout

- Single line: a pill [fully rounded] on the muted fill with no border and no shadow. Left to right it holds attach (`plus`), the textarea, the model picker ("Auto" + chevron), mic, and send.
- Wrapped: once the text wraps, the pill becomes a rounded rectangle [`--radius` + 4px]. The textarea spans the full width on top with an expand toggle at its top right, and the buttons form a row below: attach on the left; model, mic and send on the right.
- Switch between the two layouts with CSS grid template areas on the same elements, so the textarea never remounts and keeps focus and caret. Give every cell a name: a `.` empty cell can be minified into an invalid value, so use a named spacer cell instead.
- Detect wrapping in the change handler (`scrollHeight` above the single-line height [44px]), not in an effect. Return to the pill only when the text is cleared, not when it shrinks back to one line, so the layout does not flicker while typing.
- Width: on a full chat page the composer is centred at [50%] of the main area from [640px] and full width below that. In a side panel it is full width.
- Empty full chat page: the single-line composer's centre sits on the middle of the panel (the header floats over the top meanwhile), the welcome title just above it and the example prompts under it as a list, one prompt per row at the composer's width. The first send removes the list and slides the composer down to the bottom [250ms, `transform` only, none under reduced motion]. Keep it the same element the whole time (only its container grows or not), so the textarea keeps focus.
- Waiting for a reply: until the first token or card arrives, the reply shows a pulsing "Thinking..." line with a `sparkles` icon, then the streamed text with a cursor.
- Hide secondary controls (the model picker) with a container query on the composer's own width [below 448px], not with a viewport breakpoint. The same component lives in a wide page and in a narrow side panel.

### Textarea

- The textarea grows with its content (`field-sizing: content`) up to [200px], then scrolls.
- The expand toggle only appears in the wrapped layout. It grows the textarea to [40-60dvh], uses `aria-pressed`, and changes its icon (`maximize-2` / `minimize-2`).
- The placeholder stays on one line and truncates.
- Enter sends and Shift+Enter inserts a newline. Do not send while an IME composition is active (`isComposing`), or Vietnamese and other IME input breaks.
- The textarea has an accessible name (`aria-label`).

### Send

- The send button is round [40px] in the primary colour with an `arrow-up` icon [20px] and an `aria-label`. Use its own icon-button recipe, not the full-size primary button with overrides.
- It is disabled when the trimmed text is empty, when the text is over the length limit, while a reply is streaming, and while the chat is disabled.
- Over the limit [4000 characters], a line under the composer states the limit and the current count.

### Model picker

- The ghost button shows the conversation's model label, or "Auto" when it has none or its model is no longer offered; the label truncates. It opens a raised menu upward (`menuitemradio` items, the current one checked with `check` [16px]): "Auto" first, then the models of `GET /models`. Opening focuses the checked item; arrow keys move and wrap, Home and End jump; Escape or a pick closes it with focus back on the button, a press outside just closes it.
- A pick saves on the conversation (`PATCH /conversations/{id}`); before the first message it is held and sent with `POST /conversations`.
- When `GET /models` returns no models (a provider without a list), the picker stays a "Coming soon" control like attach and mic.

### Features not built yet

- Attach and mic (and the model picker when there are no models) stay visible but use `aria-disabled="true"` instead of `disabled`, so they stay focusable and show a "Coming soon" tooltip. They are dimmed, show the not-allowed cursor, and have no hover fill.

### Floating over the thread

- The composer is `sticky` at the bottom of the thread's own scroll container, so messages scroll behind it.
- Above the composer, a fade [24px] runs from transparent to the host surface fill. Below it, a solid strip in the same fill holds the status lines and the disclaimer. The fill depends on the host: the page background on the chat page, the card fill in a panel.
- The outer wrapper uses `pointer-events: none` and the composer and strip use `pointer-events: auto`, so the fade never blocks scrolling or clicks on the messages under it.
- A sticky header at the top of the thread gets the matching fade below it.
- The focus halo [3px ring at 30%] on `focus-within` must not be clipped. Raise the composer wrapper above the strip that follows it (`relative z-10`), and keep `overflow: hidden` off its ancestors.

### States and messages

- When the chat is disabled (a job running, quota used up), the composer drops to [60%] opacity and the reason shows above the disclaimer. The quota message includes the reset time.
- The disclaimer is one 12px muted centred line saying that answers are for reference only and that prices should be checked on the provider sites.
- The thread auto-scrolls to new content only while the user is already near the bottom. It never pulls them down while they read older messages.

### Tests

- Sending a message by click and by Enter.
- The length limit message, with the send button disabled.
- The disabled state shows its reason.
- The empty chat shows the welcome panel, and an example prompt sends itself.
- The empty full chat page puts the composer before the example list, one button per example, and the list goes on the first send.
- "Thinking..." shows until the first token arrives.
