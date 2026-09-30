# Practice subscription clocks

Kindred’s two prices are both one month. On the development app, that plan renews every 5 minutes and ends about 25 minutes after the purchase. Use the lists below when the price length changes, or when a preview install uses Apple or Google instead of RevenueCat’s Test Store.

These clocks are for practice purchases. A real store subscription lasts the length the customer bought. A renewal is one practice period. The plan then stops on its own. You do not cancel it to see Supporter turn off. A minute of drift is normal.

Buy, restore, and expiry for this version are on Kindred(Dev), the app whose id ends in `.dev`. The preview app can show the paywall. It does not complete a Test Store purchase.

## RevenueCat Test Store

This is the development app. The plan renews up to five times, then it ends. Source: [Test Store](https://www.revenuecat.com/docs/test-and-launch/sandbox/test-store), section “Subscription renewals and expiration.”

- 1 week: renews every 5 minutes. Ends about 25 minutes after the purchase.
- 1 month: renews every 5 minutes. Ends about 25 minutes after the purchase.
- 2 months: renews every 10 minutes. Ends about 50 minutes after the purchase.
- 3 months: renews every 15 minutes. Ends about 75 minutes after the purchase.
- 6 months: renews every 30 minutes. Ends about 150 minutes after the purchase.
- 1 year: renews every hour. Ends about 5 hours after the purchase.

## Apple sandbox

Preview on iPhone, if a later test uses Apple’s practice shop. This is the default tester speed. App Store Connect can speed that tester up or slow them down. The plan renews up to 12 times, then it ends. TestFlight uses a slower clock. This version does not use TestFlight. Source: [Apple sandbox account settings](https://developer.apple.com/help/app-store-connect/test-in-app-purchases/manage-sandbox-apple-account-settings/).

- 1 week: 3 minutes
- 1 month: 5 minutes
- 2 months: 10 minutes
- 3 months: 15 minutes
- 6 months: 30 minutes
- 1 year: 1 hour

## Google license tester

Preview on Android, if a later test uses Google’s practice shop. Times are approximate. The plan renews up to six times, then it cancels. Google’s list has no two-month row. Source: [Google Play test purchases](https://developer.android.com/google/play/billing/test), section “Renewal periods.”

- 1 week: 5 minutes
- 1 month: 5 minutes
- 3 months: 10 minutes
- 6 months: 15 minutes
- 1 year: 30 minutes
