# SQL GROUP BY Error

## 1. What did you ask the AI to help you with, and why did you choose to use AI for that specific task?

I ran into an error when querying my events table that I didn't fully understand. The error was telling me that `users.username` needed to appear in the `GROUP BY` clause, but I wasn't sure why that was required or what the rule was behind it. I chose to use AI because I wanted to understand why PostgreSQL was enforcing this before just blindly adding columns to my query.

> "I'm building an event-planning API. When I run a SQL query to get all events along with their RSVP counts, I keep getting the error 'column users.username must appear in the GROUP BY clause or be used in an aggregate function'. Can you explain why this happens and how to fix it?"

## 2. How did you evaluate whether the AI's output was correct or useful before using it?

The AI explained that PostgreSQL requires every column in the `SELECT` clause to either appear in the `GROUP BY` clause or be wrapped in an aggregate function. In my code, I was selecting many columns but only grouping by `events.event_id`.

## 3 How did what the AI produce differ from what you ultimately used, and what does that tell you about your own understanding of the problem?

The AI's suggested query was mostly what I needed, but I had to make sure all the correct columns from my specific schema were included in the `GROUP BY` clause, since the AI used generic column names in its example.

## 4. What did you learn from using AI in this way?

Working through this error taught me that PostgreSQL is much stricter than other databases like MySQL when it comes to the SQL standard. I didn't realize that every column in a `SELECT` clause needs to either be in the `GROUP BY` clause or wrapped in an aggregate function. I had assumed that grouping by the primary key `events.event_id` would be enough since all other columns depend on it, but PostgreSQL doesn't automatically infer that. This is something I'll keep in mind for every query I write going forward.

# Logout Cookie Session

## 1. What did you ask the AI to help you with, and why did you choose to use AI for that specific task?

My logout function wasn't properly clearing the session data after a user logged out, and I wasn't sure whether the problem was with how I was destroying the session, clearing the cookie, or something else entirely. I had tried a few different approaches but kept running into the same issue. I used AI because I wanted someone to help me understand what was actually happening with the session lifecycle rather than just trying random fixes.

> "I'm building an event-planning API and my logout function isn't clearing the cookie session data properly. Can you explain why req.session = null might not be working and what the correct approach is for clearing sessions?"

## 2. How did you evaluate whether the AI's output was correct or useful before using it?

The AI helped me realize the problem wasn't just in my logout function but also in how I was testing it. It explained that when using `curl` to test cookie-based authentication, you need both the `-b` flag to send cookies and the `-c` flag to save updated cookies back to the file. I verified this by re-running my `curl` commands with both flags and confirmed that after logout, the `/me` endpoint no longer returned user data.

## 3. How did what the AI produce differ from what you ultimately used, and what does that tell you about your own understanding of the problem?

The AI initially suggested solutions using `session.destroy()` and `clearCookie()`, which didn't apply to my setup since I was using `cookie-session` middleware rather than `express-session`. After sharing my actual cookie names (`session` and `session.sig`), the AI correctly identified my middleware and confirmed that `req.session = null` was the right approach. The real fix ended up being in how I was testing rather than in the code itself.

## 4. What did you learn from using AI in this way?

This whole debugging process taught me the importance of knowing which middleware you're actually using before trying to fix something. I spent time trying solutions meant for `express-session` when I was actually using `cookie-session`, which behaves differently. I also learned that sometimes the bug isn't in your code at all — it was in how I was testing it. Learning that `curl` requires both `-b` and `-c` flags to properly handle cookies was a really practical takeaway that I'll use whenever I'm testing authentication flows from the command line.

# LEFT JOIN for Missing Events

## 1. What did you ask the AI to help you with, and why did you choose to use AI for that specific task?

I noticed that some of my events weren't showing up when I queried for all events with their RSVP counts, but my query wasn't throwing any errors, which made it hard to figure out what was wrong. I wasn't sure if the issue was with my `JOIN`, my `GROUP BY`, or something else in the query. I chose to use AI because the query appeared to be working fine on the surface and I needed help understanding why certain rows were being silently excluded from my results.

> "I'm querying all events along with their RSVP counts but some events aren't showing up in the results. Can you explain why some events might be missing and what kind of JOIN I should be using?"

## 2. How did you evaluate whether the AI's output was correct or useful before using it?

The AI explained the difference between `INNER JOIN` and `LEFT JOIN`. An `INNER JOIN` on the `rsvps` table only returns events that have at least one RSVP, meaning events with zero RSVPs are completely excluded. This immediately explained why some events were missing. I tested this by switching to a `LEFT JOIN` and confirmed that all events appeared, with events having no RSVPs showing a count of `0`.

## 3. How did what the AI produce differ from what you ultimately used, and what does that tell you about your own understanding of the problem?

The AI's suggested fix of switching to a `LEFT JOIN` worked as expected. I also combined this fix with the `GROUP BY` correction from earlier so that both issues were resolved in the same final query.

## 4. What did you learn from using AI in this way?

This taught me that the wrong `JOIN` type can silently exclude data from your results without throwing any errors, which makes it a particularly tricky bug to catch. My query was running fine and returning results, so I had no reason to think anything was wrong until I noticed certain events were missing. Understanding the difference between `INNER JOIN` and `LEFT JOIN` — and that an `INNER JOIN` requires a match on both sides — is something I now think about every time I'm joining tables where one side might not have related records.
