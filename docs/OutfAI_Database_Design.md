# OutfAI — Database Design

## Overview

The database is designed to be wardrobe-first, extensible, and friendly to future recommendation improvements.

**Database:** PostgreSQL  
**ORM:** Prisma

---

## Core Tables

### users

Stores basic user identity information.

```sql
id (pk)
email
name
created_at
```

---

### garments

Represents individual clothing items owned by users.

```sql
id (pk)
user_id (fk)
name
category
primary_color
secondary_color
material
season
image_original_url
image_processed_url
image_thumbnail_url
created_at
```

---

### garment_tags

Stores tags assigned by AI or user corrections.

```sql
id (pk)
garment_id (fk)
tag
source (auto | user)
```

---

### outfits

Represents a generated outfit instance.

```sql
id (pk)
user_id (fk)
context_weather
context_mood
created_at
```

---

### outfit_items

Links garments to outfits.

```sql
id (pk)
outfit_id (fk)
garment_id (fk)
position
```

---

### recommendation_logs

Tracks user interactions with recommendations.

```sql
id (pk)
user_id
outfit_id
action (shown | saved | skipped | worn)
timestamp
```

---

## Optional Commerce Tables

### external_products

Represents storefront items.

```sql
id (pk)
source
name
category
color
price
image_url
product_url
```

---

### product_matches

Explains why a product fits a wardrobe.

```sql
id (pk)
product_id (fk)
garment_id (fk)
reason
```

---

## Design Principles

- Normalize wardrobe data
- Log interactions, not opinions
- Keep explanations first-class
- Avoid schema rewrites later

This schema supports MVP needs while enabling future personalization and learning.
