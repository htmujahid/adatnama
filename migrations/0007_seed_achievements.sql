INSERT OR IGNORE INTO "achievement" ("id", "name", "description", "icon", "target", "createdAt") VALUES
  ('first-step',   'First step',   'Complete your first check-in',                    'flag',     1,    date('now')),
  ('week-warrior', 'Week warrior', 'Hit a 7-day streak',                              'flame',    7,    date('now')),
  ('consistent',   'Consistent',   'Score 80%+ completion in a week',                 'target',   80,   date('now')),
  ('team-player',  'Team player',  'Join a circle',                                   'users',    1,    date('now')),
  ('early-riser',  'Early riser',  'Complete a habit with a reminder before 7 AM',    'sunrise',  1,    date('now')),
  ('month-master', 'Month master', 'Hit a 30-day streak',                             'trophy',   30,   date('now')),
  ('century-club', 'Century club', 'Hit a 100-day streak',                            'gem',      100,  date('now')),
  ('perfect-week', 'Perfect week', 'Every habit, every day for a week',               'sparkles', NULL, date('now'));
