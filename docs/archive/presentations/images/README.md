# Presentation images

Screenshots and other images for each presentation. Use one subfolder per presentation so assets stay organized.

## Structure

```
images/
├── README.md
├── capstone-progress-update-1/   ← Screenshots for Capstone Progress Update 1
│   └── (add .png, .jpg, etc.)
└── (future presentations get their own subfolders)
```

## Adding screenshots

1. Add image files into the subfolder for that presentation (e.g. `capstone-progress-update-1/`).
2. In the presentation HTML, reference them with a relative path, e.g.  
   `../../images/capstone-progress-update-1/your-screenshot.png`

## Adding a new presentation folder

When you add a new presentation, create a matching subfolder here with the same name/slug, e.g. `capstone-progress-update-2/`.
