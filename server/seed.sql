-- Optional sample data — safe to skip in production.
-- Replace the placeholder URLs with real Supabase Storage URLs once you've
-- uploaded real media via POST /api/upload.

insert into artists (id, name, image_url, bio) values
  ('11111111-1111-1111-1111-111111111111', 'Sample Artist', null, 'A placeholder artist for local testing.')
on conflict (id) do nothing;

insert into albums (id, title, artist_id, cover_url, release_year) values
  ('22222222-2222-2222-2222-222222222222', 'Sample Album', '11111111-1111-1111-1111-111111111111', null, 2024)
on conflict (id) do nothing;

insert into songs (id, title, artist_id, album_id, cover_url, audio_url, duration_seconds) values
  ('33333333-3333-3333-3333-333333333333', 'Sample Song', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', null, 'https://example.com/placeholder.mp3', 180)
on conflict (id) do nothing;

insert into playlists (id, name, description, cover_url, song_ids) values
  ('44444444-4444-4444-4444-444444444444', 'My First Playlist', 'A starter playlist', null, array['33333333-3333-3333-3333-333333333333']::uuid[])
on conflict (id) do nothing;
