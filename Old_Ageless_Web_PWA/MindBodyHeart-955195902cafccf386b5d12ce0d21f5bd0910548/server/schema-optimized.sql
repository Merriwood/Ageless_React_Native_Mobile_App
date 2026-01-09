-- Enhanced schema with better indexes and constraints
-- Run this as a migration

-- Add better indexes for summary performance
CREATE INDEX IF NOT EXISTS idx_entries_user_date_desc ON entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_fitness_data ON entries USING GIN(fitness_data);
CREATE INDEX IF NOT EXISTS idx_entries_created_week ON entries(user_id, date_trunc('week', entry_date));

-- Add constraints for data integrity
ALTER TABLE entries 
ADD CONSTRAINT check_weight_range 
CHECK (weight IS NULL OR (weight >= 50 AND weight <= 1000));

-- Add partial index for non-null weights (performance)
CREATE INDEX IF NOT EXISTS idx_entries_weight_notnull ON entries(user_id, entry_date) 
WHERE weight IS NOT NULL;

-- View for optimized weekly summaries
CREATE OR REPLACE VIEW weekly_summaries AS
SELECT 
  user_id,
  date_trunc('week', entry_date)::date as week_start,
  COUNT(*) as workout_days,
  AVG(weight) FILTER (WHERE weight IS NOT NULL) as avg_weight,
  jsonb_object_agg(
    exercise_name, 
    total_sets
  ) FILTER (WHERE exercise_name IS NOT NULL) as exercise_totals,
  SUM(total_sets) FILTER (WHERE exercise_name IS NOT NULL) as total_weekly_sets
FROM entries,
LATERAL (
  SELECT key as exercise_name, (value::text::int) as total_sets
  FROM jsonb_each_text(fitness_data)
  WHERE value::text::int > 0
) exercises
WHERE entry_date >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY user_id, date_trunc('week', entry_date)
ORDER BY user_id, week_start DESC;

-- Function for efficient summary calculation
CREATE OR REPLACE FUNCTION get_user_summary(p_user_id INTEGER)
RETURNS TABLE(
  week_of_sunday DATE,
  weight_avg DECIMAL(5,2),
  totals JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ws.week_start,
    ROUND(ws.avg_weight::numeric, 2)::decimal(5,2),
    ws.exercise_totals
  FROM weekly_summaries ws
  WHERE ws.user_id = p_user_id
  ORDER BY ws.week_start DESC
  LIMIT 12;
END;
$$ LANGUAGE plpgsql STABLE;
