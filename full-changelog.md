# HYVE Tenant Side — Full Changelog

## Starting point
Tenant frontend was a visual template matching the Figma design system exactly
(colors, fonts) but with almost no working functionality — only auth made a real
API call, and even that call hit endpoints that didn't exist on any real backend.

## Auth — real production API (hyvn-api-production-66db.up.railway.app)
- Sign up, OTP verification, resend OTP, login — all call the real, live endpoints
- Fixed a bug where the JWT token wasn't sent in the format the backend expects
  (`Bearer <token>`), which would've silently broken every authenticated request
- Profile page shows real signed-up user data
- Edit Profile actually saves changes via the real `PUT /user/profile` endpoint
  (previously: hardcoded fake name, form had no submit handler at all)
- Change Password section clearly marked unavailable rather than pretending to
  work — no such endpoint exists on the backend yet

## Property listings — real data, everywhere
- Dashboard, Search, and Saved pages all pull real properties from the backend
  instead of 6 identical hardcoded dummy listings
- Search box and sort dropdown are real and functional (previously rendered but
  did nothing)
- Save/unsave persists on the server, not just in the browser — heart icon
  reflects real state across devices/sessions
- Apartment Details page fetches the real property by ID
- Apartment reviews display real reviewer names and comments from the backend

## Chat — real rooms, messages, and live delivery
- Real chat rooms and message history from the backend
- Send button actually sends messages (previously had no click handler at all)
- Live message delivery via Server-Sent Events — messages from the other person
  appear without refreshing
- Fixed a real bug: "Chat with Landlord" was hardcoded to always open the same
  fake conversation (room #1) regardless of which apartment/landlord — now opens
  the correct room for the actual landlord on that specific listing
- Fixed the landlord name/photo shown on Apartment Details, which was hardcoded
  to a placeholder ("Bisola Akanji") for every listing

## Notifications — real, with correct behavior
- Real notification list from the backend, replacing Lorem placeholder text
- Click marks as read and navigates to the relevant screen (message → chat,
  save → saved list, review/booking → manage apartment)
- Mark-all-as-read works for real

## Reviews
- Review form on Manage Apartment (previously had no submit handler at all) now
  posts a real review to the backend for the tenant's current booked apartment

## Reservation → Current Lodge
- Completing a reservation now shows up as the tenant's "Current Lodge" on the
  dashboard, instead of a payment success screen that led nowhere
- Current Lodge card correctly hides when there's no active booking, instead of
  always showing a fake "Lid Lodge" placeholder

## Known, documented gaps (not fixed — reasons given, not silently skipped)
- **Reservation/booking has no backend endpoint at all** — the real API only
  covers auth, properties, notifications, and chat. Booking a tour/move-in
  currently only updates the frontend's own "current lodge" tracking, nothing
  persists server-side. This needs backend work before it's real.
- **"Renew Stay" button has no destination** (`to=""`) — needs a product
  decision on what it should actually do, not a coding fix
- **Apartment queue system is entirely fake** — hardcoded position/wait-time
  data with zero matching backend endpoint. Not something to fix from the
  frontend; flag to product/backend if this feature is actually needed
- **Amenities/Property Type filters shown in the Figma design were never built
  into the code at all** — not a bug, a genuine feature gap for a future phase
- **Chat can't be started fresh with a landlord from outside a listing page** —
  only from "Message Owner"/"Chat with Landlord" on a specific property
- **Chat list can't show a real last-message preview** — the backend's room list
  doesn't include one; would need an extra fetch per room to build that

## Corrections made along the way (transparency)
- Initially reported auth as "working end-to-end" — was wrong; it called URLs
  that didn't exist. Caught and fixed once actually checked against real routes.
- Initially wired several features (save, notifications, chat send) to
  localStorage as a bridge before the real API was known to exist — all since
  replaced with real backend calls once the actual API was found.
