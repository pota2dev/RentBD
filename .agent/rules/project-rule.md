---
trigger: always_on
---

Here is the The Project Structure that must follow this MVC:
All files of a route (if not shared or common) is within it's directory.

/<RouteName>
-- page.tsx - Controller (starting point, communicates with both Model and View)
-- api/route.ts - Part of controller but processes http url requests (GET, POST, PUT, DELETE).
-- model.ts - Model (business and database interaction logic via prisma)
-- view.tsx - View (Contains the view/UI code)

Use shadcn/ui to create the front-end. Don't apply too much extra styling.
The project uses prisma ORM. schema.prisma contrains the schema.
