# TODO

- [x] Update `src/routes/rider/dashboard.tsx` to split rider action buttons:
  - [x] Add `markPickedUp` button shown for `assigned` / `confirmed`
  - [x] Add new `markOnTheWay` button shown for `picked_up` → update status to `out_for_delivery`
  - [x] Keep existing `markDelivered` button shown for `out_for_delivery` → `delivered`
  - [x] Ensure after each update the dashboard refreshes


- [x] Update `src/components/OrderProgressBar.tsx` / `src/lib/constants.ts` mapping so consumer progress matches:
  - [x] `pending` → Order Placed
  - [x] `assigned`/`confirmed` → Order Confirmed
  - [x] `picked_up` → Picked Up
  - [x] `out_for_delivery` → On the Way
  - [x] `delivered` → Delivered





- [x] Run typecheck/build (if available) to ensure no TS errors



