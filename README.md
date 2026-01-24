# Parfumerie - Fragrance Library & Discovery App

A personal fragrance library and discovery platform built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Browse Fragrances**: Search and filter through a collection of fragrances
- **Detailed Views**: View comprehensive information about each fragrance including notes, ratings, and descriptions
- **Personal Library**: Organize fragrances into Owned, Want, and Tested shelves
- **Rating & Reviews**: Rate and review fragrances with a 1-10 scale and text reviews
- **Responsive Design**: Beautiful, modern UI that works on all devices

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Context for state management
- localStorage for persistence

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `app/` - Next.js app router pages
- `components/` - React components
  - `ui/` - shadcn/ui components
  - `fragrance/` - Fragrance-related components
  - `filters/` - Filter components
  - `layout/` - Layout components
  - `shelves/` - Shelf management components
- `lib/` - Utilities, types, and mock data
- `context/` - React Context providers

## Current Status

This is a **prototype** with mock data. Features include:
- ✅ Browse and search fragrances
- ✅ Filter by gender, season, time of day, and notes
- ✅ View detailed fragrance information
- ✅ Add fragrances to personal shelves
- ✅ Rate and review fragrances
- ✅ Responsive design

Future enhancements:
- Real database integration
- Authentication
- AI recommendations
- Data scraping for fragrance information
