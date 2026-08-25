-- Demo/test data: Pink Floyd's discography, two accounts, and a handful of reviews.
-- Both accounts log in with the password: Password1!

INSERT INTO public.genre (id, genre) OVERRIDING SYSTEM VALUE VALUES
    (1, 'progressive rock'),
    (2, 'art rock'),
    (3, 'psychedelic rock'),
    (4, 'space rock');

INSERT INTO public.artist (id, artist_name, country, artist_type, biography, artist_pic) OVERRIDING SYSTEM VALUE VALUES
    (1, 'Pink Floyd', 'United Kingdom', 'Group',
     'English rock band formed in London in 1965, known for their philosophical lyrics, sonic experimentation, and elaborate live shows.',
     'defaultArtistPhoto.jpg');

INSERT INTO public.album (id, title, release_date, cover_pic, rating, reviews_count, description, created_at) OVERRIDING SYSTEM VALUE VALUES
    (1, 'The Piper at the Gates of Dawn', '1967-08-05', 'The_Piper_At_The_Gates_Of_Dawn.png', 0, 0, 'Pink Floyd''s psychedelic debut, led largely by Syd Barrett.', now()),
    (2, 'A Saucerful of Secrets', '1968-06-29', 'A_Saucerful_of_Secrets.png', 0, 0, 'The transitional second album, the only one to feature all five band members.', now()),
    (3, 'Meddle', '1971-10-30', 'Meddle.png', 4.5, 1, 'A bridge between the band''s experimental years and their commercial peak, closing with the 23-minute ''Echoes''.', now()),
    (4, 'The Dark Side of the Moon', '1973-03-01', 'Dark_Side_of_the_Moon.png', 4.75, 2, 'A concept album exploring conflict, greed, time, and mental illness; one of the best-selling albums of all time.', now()),
    (5, 'Wish You Were Here', '1975-09-12', 'Wish_You_Were_Here.png', 5.0, 1, 'A tribute to founding member Syd Barrett, framed by the two-part ''Shine On You Crazy Diamond''.', now()),
    (6, 'Animals', '1977-01-23', 'Animals.png', 4.0, 1, 'A loose concept album inspired by George Orwell''s Animal Farm.', now()),
    (7, 'The Wall', '1979-11-30', 'The_Wall.png', 5.0, 1, 'A rock opera about isolation, built around the character of Pink.', now()),
    (8, 'The Division Bell', '1994-03-28', 'The_Division_Bell.png', 0, 0, 'The band''s final studio album with Roger Waters absent, themed around communication.', now());

INSERT INTO public.album_artist (album_id, artist_id, "position") VALUES
    (1, 1, 0), (2, 1, 0), (3, 1, 0), (4, 1, 0), (5, 1, 0), (6, 1, 0), (7, 1, 0), (8, 1, 0);

INSERT INTO public.album_genre (album_id, genre_id, weight) VALUES
    (1, 3, 10), (1, 4, 6), (1, 2, 3),
    (2, 3, 9), (2, 4, 8), (2, 1, 4),
    (3, 1, 9), (3, 4, 7), (3, 2, 4),
    (4, 1, 10), (4, 2, 6),
    (5, 1, 10), (5, 2, 7),
    (6, 1, 9), (6, 2, 5),
    (7, 1, 9), (7, 2, 6),
    (8, 1, 9), (8, 2, 5);

INSERT INTO public.song (id, "position", title, duration, album_id) OVERRIDING SYSTEM VALUE VALUES
    -- The Piper at the Gates of Dawn
    (1, 1, 'Astronomy Domine', '00:04:12', 1),
    (2, 2, 'Lucifer Sam', '00:03:07', 1),
    (3, 3, 'Matilda Mother', '00:03:08', 1),
    (4, 4, 'Flaming', '00:02:46', 1),
    (5, 5, 'Pow R. Toc H.', '00:04:26', 1),
    (6, 6, 'Take Up Thy Stethoscope and Walk', '00:03:05', 1),
    (7, 7, 'Interstellar Overdrive', '00:09:41', 1),
    (8, 8, 'The Gnome', '00:02:13', 1),
    (9, 9, 'Chapter 24', '00:03:42', 1),
    (10, 10, 'The Scarecrow', '00:02:11', 1),
    (11, 11, 'Bike', '00:03:21', 1),
    -- A Saucerful of Secrets
    (12, 1, 'Let There Be More Light', '00:05:38', 2),
    (13, 2, 'Remember a Day', '00:04:33', 2),
    (14, 3, 'Set the Controls for the Heart of the Sun', '00:05:27', 2),
    (15, 4, 'Corporal Clegg', '00:04:13', 2),
    (16, 5, 'A Saucerful of Secrets', '00:11:57', 2),
    (17, 6, 'See-Saw', '00:04:36', 2),
    (18, 7, 'Jugband Blues', '00:03:00', 2),
    -- Meddle
    (19, 1, 'One of These Days', '00:05:57', 3),
    (20, 2, 'A Pillow of Winds', '00:05:13', 3),
    (21, 3, 'Fearless', '00:06:08', 3),
    (22, 4, 'San Tropez', '00:03:44', 3),
    (23, 5, 'Seamus', '00:02:15', 3),
    (24, 6, 'Echoes', '00:23:31', 3),
    -- The Dark Side of the Moon
    (25, 1, 'Speak to Me', '00:01:30', 4),
    (26, 2, 'Breathe', '00:02:43', 4),
    (27, 3, 'On the Run', '00:03:36', 4),
    (28, 4, 'Time', '00:06:53', 4),
    (29, 5, 'The Great Gig in the Sky', '00:04:44', 4),
    (30, 6, 'Money', '00:06:22', 4),
    (31, 7, 'Us and Them', '00:07:49', 4),
    (32, 8, 'Any Colour You Like', '00:03:25', 4),
    (33, 9, 'Brain Damage', '00:03:47', 4),
    (34, 10, 'Eclipse', '00:02:03', 4),
    -- Wish You Were Here
    (35, 1, 'Shine On You Crazy Diamond (Parts I-V)', '00:13:31', 5),
    (36, 2, 'Welcome to the Machine', '00:07:28', 5),
    (37, 3, 'Have a Cigar', '00:05:08', 5),
    (38, 4, 'Wish You Were Here', '00:05:34', 5),
    (39, 5, 'Shine On You Crazy Diamond (Parts VI-IX)', '00:12:31', 5),
    -- Animals
    (40, 1, 'Pigs on the Wing 1', '00:01:25', 6),
    (41, 2, 'Dogs', '00:17:06', 6),
    (42, 3, 'Pigs (Three Different Ones)', '00:11:22', 6),
    (43, 4, 'Sheep', '00:10:24', 6),
    (44, 5, 'Pigs on the Wing 2', '00:01:26', 6),
    -- The Wall (selected tracks)
    (45, 1, 'In the Flesh?', '00:03:20', 7),
    (46, 2, 'Another Brick in the Wall, Pt. 1', '00:03:11', 7),
    (47, 3, 'The Happiest Days of Our Lives', '00:01:46', 7),
    (48, 4, 'Another Brick in the Wall, Pt. 2', '00:03:59', 7),
    (49, 5, 'Mother', '00:05:32', 7),
    (50, 6, 'Goodbye Blue Sky', '00:02:45', 7),
    (51, 7, 'Hey You', '00:04:40', 7),
    (52, 8, 'Comfortably Numb', '00:06:23', 7),
    (53, 9, 'Run Like Hell', '00:04:19', 7),
    -- The Division Bell (selected tracks)
    (54, 1, 'Cluster One', '00:05:58', 8),
    (55, 2, 'What Do You Want from Me', '00:04:21', 8),
    (56, 3, 'Poles Apart', '00:07:04', 8),
    (57, 4, 'Marooned', '00:05:29', 8),
    (58, 5, 'A Great Day for Freedom', '00:04:17', 8),
    (59, 6, 'Coming Back to Life', '00:06:19', 8),
    (60, 7, 'High Hopes', '00:08:31', 8);

INSERT INTO public.song_artist (song_id, artist_id, "position")
SELECT id, 1, 0 FROM public.song WHERE id BETWEEN 1 AND 60;

-- Both accounts below log in with the password: Password1!
INSERT INTO public.user_account (id, username, password, email, join_date, bio, profile_pic, user_role) OVERRIDING SYSTEM VALUE VALUES
    (1, 'demo', '$2a$10$ILEWYiQgq4Kc80eJwea48.AE3IEaqC0ozarEZXZ66uwEns9O5uWui', 'demo@soundtrack.local',
     '2026-01-15 10:00:00', 'Just here for the music.', 'userDefault.png', 'USER'),
    (2, 'admin', '$2a$10$ILEWYiQgq4Kc80eJwea48.AE3IEaqC0ozarEZXZ66uwEns9O5uWui', 'admin@soundtrack.local',
     '2026-01-10 09:00:00', 'Keeping the catalog tidy.', 'userDefault.png', 'ADMIN');

INSERT INTO public.user_follow (follower_id, following_id) VALUES
    (1, 2);

INSERT INTO public.review (rating, title, review_comment, album_id, user_id, created_at) VALUES
    (5.0, 'A masterpiece', 'Every track flows into the next. The production still sounds incredible decades later.', 4, 1, '2026-08-20 18:30:00'),
    (4.5, 'Essential listening', 'Holds up as one of the most cohesive albums ever made, front to back.', 4, 2, '2026-08-10 12:00:00'),
    (5.0, 'Underrated favorite', 'Shine On is one of the best openers in rock history. Beautiful tribute to Syd.', 5, 1, '2026-07-15 20:15:00'),
    (4.0, 'Bleak but brilliant', 'Dogs alone makes this worth it. Not as accessible as Dark Side but rewarding.', 6, 1, '2026-08-22 09:45:00'),
    (4.5, 'A hidden gem', 'Echoes is a journey. Great transition point in their discography.', 3, 2, '2026-06-01 14:20:00'),
    (5.0, 'The whole story', 'Ambitious and theatrical. Comfortably Numb is untouchable.', 7, 2, '2026-08-23 21:00:00');

SELECT setval('public.genre_id_seq', (SELECT MAX(id) FROM public.genre));
SELECT setval('public.artist_id_seq', (SELECT MAX(id) FROM public.artist));
SELECT setval('public.album_id_seq', (SELECT MAX(id) FROM public.album));
SELECT setval('public.song_id_seq', (SELECT MAX(id) FROM public.song));
SELECT setval('public.user_account_id_seq', (SELECT MAX(id) FROM public.user_account));
