# Resource Template — Copy/Paste New Resource (Backend + Frontend)

This folder is meant to be copied to scaffold a new resource quickly.

## How to use

1. Choose a resource name, e.g. `garments`, `outfits`, `recommendations`.
2. Copy the backend template files into:
   - `server/api/routers/<resource>.ts`
   - `server/services/<Resource>Service.ts`
   - `server/actions/<resource>Actions.ts`
   - `shared/schemas/<resource>.ts`
   - `shared/types/<resource>.ts` (optional if schemas export types)
3. Copy the frontend template files into:
   - `apps/web/app/<route>/page.tsx`
   - `apps/web/components/<resource>/<resource>-panel.tsx`
   - `apps/web/hooks/use-<resource>.ts`
4. Replace all `__RESOURCE__`, `__Resource__`, `__resource__`, `__ROUTE__`, `__ID__` placeholders.

## Naming convention

- Router file: plural (`garments.ts`)
- Actions: plural (`garmentsActions.ts`)
- Service: singular + Service (`GarmentService.ts`) or plural if preferred, but be consistent.
- UI folder: plural (`components/garments/*`)
- Hook: plural (`use-garments.ts`)
