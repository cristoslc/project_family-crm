# Product Context

## Why This Project Exists

Managing gift exchanges and relationships across an extended family during holidays is complex:
- Tracking who gave what to whom
- Remembering to send thank-you notes
- Managing holiday card lists
- Keeping balance awareness (ensuring reciprocity)
- Correcting mistakes quickly when discovered

Spreadsheets are cumbersome, especially on mobile during gift-opening moments.

## Problems It Solves

1. **Quick Mobile Logging**: Log gifts immediately during present-opening without switching to a spreadsheet
2. **Mistake Correction**: Easy edit/delete when errors are discovered later
3. **Relationship Management**: Track who's related to whom, which household they belong to
4. **Balance Awareness**: See gift totals by household to maintain reciprocity
5. **Card Tracking**: Manage holiday card sending status
6. **Historical Import**: Bring in data from existing spreadsheets via API

## How It Should Work

### Primary Use Case: Gift Logging During Holidays

**Scenario**: Christmas morning, opening presents
1. Open app on phone
2. Tap "Log Gift Received"
3. Select giver (search or quick pick)
4. Select receiver (chip: "Me", "Spouse", or child)
5. Enter description, tap value preset ($25)
6. Tap "Save & Add Another"
7. Repeat for next gift

**Time**: < 30 seconds per gift

### Secondary Use Case: Review & Correction

**Scenario**: Later, reviewing logged gifts
1. Open "Today's Gifts"
2. See list of all gifts
3. Tap gift to edit (fix typo, adjust value)
4. Or swipe to delete if duplicate

### Tertiary Use Case: Household Management

**Scenario**: Someone moves, households merge
1. Open "Households"
2. Find household
3. Tap "Merge with another household"
4. Select target household
5. Confirm (moves all people, gifts, cards automatically)

## User Experience Goals

### Mobile-First
- Comfortable one-handed use
- Large touch targets (no tiny buttons)
- Minimal typing (search, chips, presets)
- Fast loading (optimized for mobile networks)

### Quick Actions
- "Save & Add Another" for rapid entry
- Quick status updates (buttons, not forms)
- Search everywhere (people, households, events)

### Error Recovery
- Easy edit from any list view
- Swipe to delete
- Undo notifications (future enhancement)

### Clarity
- Clear navigation (always know where you are)
- Obvious primary actions
- Helpful defaults (current event, common values)

## Target Users

### Primary Users
- **"Me"**: Main user logging gifts and managing data
- **"Spouse"**: Secondary user, same permissions

### Secondary Users
- **LLM Agent (Codex)**: Automated import via API

## Success Metrics (Phase 1)

- Can log 10 gifts in < 5 minutes
- Can correct a mistake in < 30 seconds
- Can merge households in < 2 minutes
- Import API successfully processes 100+ gifts
- App runs reliably in Docker for 1+ week

