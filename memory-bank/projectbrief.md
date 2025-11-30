# Project Brief: Family Gift & Relationship Tracker

## Core Purpose

A small, full-stack application for tracking gifts, relationships, and holiday events within an extended family network. Built as a Phase 1 experiment focused on Christmas and New Year 2025/2026.

## Primary Goals

- Track people and households in extended family/social graph
- Track gifts we GIVE ("outbound") and RECEIVE ("inbound")
- Track events like "Christmas 2025" and "New Year 2026 cards"
- Support full CRUD for all core entities
- Enable quick mobile gift logging during present-opening
- Allow quick mistake correction (edit/delete bad entries)
- Support household merge/split and relationship adjustments
- Provide API for importing historical gift data from spreadsheets

## Phase 1 Constraints

- **Experimental, not production** - Optimize for speed of implementation
- **Docker-first** - MUST run in containers, not local dev only
- **Mobile-first** - Comfortable use on phones during gift-opening
- **Simple auth** - Single family, 2 users ("me" and "spouse"), no complex flows
- **Quick iteration** - Conversation-driven development

## Success Criteria

- App runs via `docker compose up -d`
- Mobile-friendly UI for quick gift logging
- Full CRUD operations work smoothly
- Import API functional for historical data
- Household merge/split capabilities
- Quick error correction workflows

## Target Users

- Primary: "Me" and "Spouse"
- Use case: Logging gifts during holiday celebrations on mobile
- Secondary: LLM agent (Codex) calling API to import spreadsheet data

