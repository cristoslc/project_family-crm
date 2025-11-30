-- Create households table (must be first due to foreign key references)
CREATE TABLE IF NOT EXISTS households (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address_line_1 VARCHAR(255),
  address_line_2 VARCHAR(255),
  city VARCHAR(100),
  region VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  card_greeting_name VARCHAR(255),
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_households_active ON households(active);

-- Create people table
CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  display_name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100),
  household_id INTEGER REFERENCES households(id) ON DELETE SET NULL,
  relationship_label VARCHAR(100),
  notes TEXT,
  is_child BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_people_household ON people(household_id);
CREATE INDEX IF NOT EXISTS idx_people_active ON people(active);

-- Create relationships table
CREATE TABLE IF NOT EXISTS relationships (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  related_person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(person_id, related_person_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_relationships_person ON relationships(person_id);
CREATE INDEX IF NOT EXISTS idx_relationships_related ON relationships(related_person_id);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  event_date DATE,
  event_type VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- Create gifts table
CREATE TABLE IF NOT EXISTS gifts (
  id SERIAL PRIMARY KEY,
  direction VARCHAR(3) NOT NULL CHECK (direction IN ('in', 'out')),
  event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
  giver_person_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  giver_household_id INTEGER REFERENCES households(id) ON DELETE SET NULL,
  receiver_person_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  receiver_household_id INTEGER REFERENCES households(id) ON DELETE SET NULL,
  description VARCHAR(500) NOT NULL,
  est_value DECIMAL(10, 2),
  given_date DATE,
  notes TEXT,
  recorded_by VARCHAR(50) NOT NULL DEFAULT 'me',
  visibility_hint VARCHAR(20) DEFAULT 'public' CHECK (visibility_hint IN ('public', 'mine_private', 'spouse_private')),
  thank_you_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gifts_direction ON gifts(direction);
CREATE INDEX IF NOT EXISTS idx_gifts_event ON gifts(event_id);
CREATE INDEX IF NOT EXISTS idx_gifts_giver_person ON gifts(giver_person_id);
CREATE INDEX IF NOT EXISTS idx_gifts_giver_household ON gifts(giver_household_id);
CREATE INDEX IF NOT EXISTS idx_gifts_receiver_person ON gifts(receiver_person_id);
CREATE INDEX IF NOT EXISTS idx_gifts_receiver_household ON gifts(receiver_household_id);
CREATE INDEX IF NOT EXISTS idx_gifts_given_date ON gifts(given_date);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  address_name VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'written', 'sent', 'returned')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, household_id)
);

CREATE INDEX IF NOT EXISTS idx_cards_event ON cards(event_id);
CREATE INDEX IF NOT EXISTS idx_cards_household ON cards(household_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
