--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account_deletion_token; Type: TABLE; Schema: public; Owner: soundtrack
--

CREATE TABLE public.account_deletion_token (
    id bigint NOT NULL,
    token_hash character varying(64) NOT NULL,
    user_id bigint NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);



--
-- Name: account_deletion_token_id_seq; Type: SEQUENCE; Schema: public; Owner: soundtrack
--

ALTER TABLE public.account_deletion_token ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.account_deletion_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: album; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.album (
    id bigint NOT NULL,
    mbid character varying(255),
    releaseid character varying(255),
    title character varying(255) NOT NULL,
    release_date date NOT NULL,
    cover_pic character varying(512),
    rating double precision DEFAULT 0,
    reviews_count bigint DEFAULT 0,
    description character varying(2400),
    created_at timestamp without time zone NOT NULL,
    CONSTRAINT chk_review_rating CHECK (((rating >= (0)::double precision) AND (rating <= (5)::double precision)))
);



--
-- Name: album_artist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.album_artist (
    album_id bigint NOT NULL,
    artist_id bigint NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);



--
-- Name: album_genre; Type: TABLE; Schema: public; Owner: soundtrack
--

CREATE TABLE public.album_genre (
    id bigint NOT NULL,
    album_id bigint NOT NULL,
    genre_id bigint NOT NULL,
    weight integer NOT NULL
);



--
-- Name: album_genre_id_seq; Type: SEQUENCE; Schema: public; Owner: soundtrack
--

ALTER TABLE public.album_genre ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.album_genre_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: album_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.album ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.album_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: album_suggestion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.album_suggestion (
    id bigint NOT NULL,
    submitted_by bigint,
    title character varying(255) NOT NULL,
    artist_name character varying(255) NOT NULL,
    release_date date,
    note character varying(500),
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    reviewed_by bigint,
    reviewed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);



--
-- Name: album_suggestion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.album_suggestion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: album_suggestion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.album_suggestion_id_seq OWNED BY public.album_suggestion.id;


--
-- Name: artist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.artist (
    id bigint NOT NULL,
    mbid character varying(255),
    artist_name character varying(255) NOT NULL,
    country character varying(255),
    artist_type character varying(255),
    biography character varying(3400),
    artist_pic character varying(512)
);



--
-- Name: artist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.artist ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.artist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: chat_message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_message (
    id bigint NOT NULL,
    room_id bigint NOT NULL,
    sender_id bigint NOT NULL,
    content character varying(1000) NOT NULL,
    sent_at timestamp without time zone DEFAULT now() NOT NULL,
    message_type character varying(20) DEFAULT 'TEXT'::character varying NOT NULL,
    CONSTRAINT chk_message_type CHECK (((message_type)::text = ANY ((ARRAY['TEXT'::character varying, 'JOIN'::character varying, 'LEAVE'::character varying, 'KICK'::character varying])::text[])))
);



--
-- Name: chat_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chat_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: chat_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chat_message_id_seq OWNED BY public.chat_message.id;


--
-- Name: chat_report_message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_report_message (
    id bigint NOT NULL,
    report_id bigint NOT NULL,
    sender_username character varying(20) NOT NULL,
    content character varying(1000) NOT NULL,
    sent_at timestamp without time zone NOT NULL
);



--
-- Name: chat_report_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chat_report_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: chat_report_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chat_report_message_id_seq OWNED BY public.chat_report_message.id;


--
-- Name: chat_room; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_room (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    topic_type character varying(10) NOT NULL,
    topic_id bigint NOT NULL,
    creator_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    max_capacity integer DEFAULT 50 NOT NULL,
    approval_required boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_topic_type CHECK (((topic_type)::text = ANY ((ARRAY['ALBUM'::character varying, 'ARTIST'::character varying, 'SONG'::character varying])::text[])))
);



--
-- Name: chat_room_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chat_room_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: chat_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chat_room_id_seq OWNED BY public.chat_room.id;


--
-- Name: chat_room_invite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_room_invite (
    chat_room_id bigint NOT NULL,
    user_id bigint NOT NULL
);



--
-- Name: chat_room_join_request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_room_join_request (
    chat_room_id bigint NOT NULL,
    user_id bigint NOT NULL
);



--
-- Name: chat_room_member; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_room_member (
    chat_room_id bigint NOT NULL,
    user_id bigint NOT NULL,
    joined_at timestamp without time zone DEFAULT now() NOT NULL
);



--
-- Name: chat_room_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_room_report (
    id bigint NOT NULL,
    reporter_id bigint,
    room_id bigint NOT NULL,
    room_name character varying(100) NOT NULL,
    topic_name character varying(255),
    category character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'OPEN'::character varying NOT NULL,
    handled_by bigint,
    resolved_by bigint,
    resolution character varying(20),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    resolved_at timestamp without time zone
);



--
-- Name: chat_room_report_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chat_room_report_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: chat_room_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chat_room_report_id_seq OWNED BY public.chat_room_report.id;


--
-- Name: edit_request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.edit_request (
    id bigint NOT NULL,
    target_type character varying(20) NOT NULL,
    target_id bigint NOT NULL,
    requested_by bigint NOT NULL,
    proposed_description text NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    reviewed_by bigint,
    reviewed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);



--
-- Name: edit_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.edit_request ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.edit_request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: favorite_album; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorite_album (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    album_id bigint NOT NULL
);



--
-- Name: favorite_album_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favorite_album_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: favorite_album_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favorite_album_id_seq OWNED BY public.favorite_album.id;


--
-- Name: favorite_song; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorite_song (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    song_id bigint NOT NULL
);



--
-- Name: favorite_song_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favorite_song_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: favorite_song_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favorite_song_id_seq OWNED BY public.favorite_song.id;


--
-- Name: genre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.genre (
    id bigint NOT NULL,
    genre character varying(255) NOT NULL
);



--
-- Name: genre_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.genre ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.genre_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notification; Type: TABLE; Schema: public; Owner: soundtrack
--

CREATE TABLE public.notification (
    id bigint NOT NULL,
    recipient_id bigint NOT NULL,
    actor_id bigint NOT NULL,
    type character varying(255) NOT NULL,
    entity_id bigint,
    read_flag boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    context character varying(255)
);



--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: soundtrack
--

ALTER TABLE public.notification ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: password_reset_token; Type: TABLE; Schema: public; Owner: soundtrack
--

CREATE TABLE public.password_reset_token (
    id bigint NOT NULL,
    token_hash character varying(64) NOT NULL,
    user_id bigint NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);



--
-- Name: password_reset_token_id_seq; Type: SEQUENCE; Schema: public; Owner: soundtrack
--

ALTER TABLE public.password_reset_token ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.password_reset_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: refresh_token; Type: TABLE; Schema: public; Owner: soundtrack
--

CREATE TABLE public.refresh_token (
    id bigint NOT NULL,
    token_hash character varying(64) NOT NULL,
    user_id bigint NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);



--
-- Name: refresh_token_id_seq; Type: SEQUENCE; Schema: public; Owner: soundtrack
--

ALTER TABLE public.refresh_token ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.refresh_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review (
    id bigint NOT NULL,
    rating real NOT NULL,
    title character varying(255) NOT NULL,
    review_comment character varying(3400) NOT NULL,
    album_id bigint NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp without time zone,
    CONSTRAINT chk_review_rating CHECK (((rating >= (0)::double precision) AND (rating <= (5)::double precision) AND ((((rating * (2)::double precision))::integer)::double precision = (rating * (2)::double precision))))
);



--
-- Name: review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.review ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.review_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: song; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.song (
    id bigint NOT NULL,
    mbid character varying(255),
    "position" smallint NOT NULL,
    title character varying(255) NOT NULL,
    duration interval NOT NULL,
    album_id bigint NOT NULL
);



--
-- Name: song_artist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.song_artist (
    song_id bigint NOT NULL,
    artist_id bigint NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);



--
-- Name: song_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.song ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.song_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: upcoming_release; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upcoming_release (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    release_date date NOT NULL,
    cover_pic character varying(255),
    payload jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);



--
-- Name: upcoming_release_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.upcoming_release_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: upcoming_release_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.upcoming_release_id_seq OWNED BY public.upcoming_release.id;


--
-- Name: user_account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_account (
    id bigint NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    join_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    bio character varying(1024),
    profile_pic character varying(512),
    user_role character varying(255) NOT NULL,
    chat_access_revoked boolean DEFAULT false NOT NULL,
    deleted_at timestamp without time zone
);



--
-- Name: user_account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_account ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_follow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_follow (
    id bigint NOT NULL,
    follower_id bigint NOT NULL,
    following_id bigint NOT NULL,
    followed_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_no_self_follow CHECK ((follower_id <> following_id))
);



--
-- Name: user_follow_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_follow_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: user_follow_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_follow_id_seq OWNED BY public.user_follow.id;


--
-- Name: user_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_list (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(1024),
    owner_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);



--
-- Name: user_list_album; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_list_album (
    list_id bigint NOT NULL,
    album_id bigint NOT NULL
);



--
-- Name: user_list_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_list ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_list_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: album_suggestion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.album_suggestion ALTER COLUMN id SET DEFAULT nextval('public.album_suggestion_id_seq'::regclass);


--
-- Name: chat_message id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message ALTER COLUMN id SET DEFAULT nextval('public.chat_message_id_seq'::regclass);


--
-- Name: chat_report_message id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_report_message ALTER COLUMN id SET DEFAULT nextval('public.chat_report_message_id_seq'::regclass);


--
-- Name: chat_room id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room ALTER COLUMN id SET DEFAULT nextval('public.chat_room_id_seq'::regclass);


--
-- Name: chat_room_report id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_report ALTER COLUMN id SET DEFAULT nextval('public.chat_room_report_id_seq'::regclass);


--
-- Name: favorite_album id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_album ALTER COLUMN id SET DEFAULT nextval('public.favorite_album_id_seq'::regclass);


--
-- Name: favorite_song id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_song ALTER COLUMN id SET DEFAULT nextval('public.favorite_song_id_seq'::regclass);


--
-- Name: upcoming_release id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upcoming_release ALTER COLUMN id SET DEFAULT nextval('public.upcoming_release_id_seq'::regclass);


--
-- Name: user_follow id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follow ALTER COLUMN id SET DEFAULT nextval('public.user_follow_id_seq'::regclass);


--
-- Name: account_deletion_token account_deletion_token_pkey; Type: CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.account_deletion_token
    ADD CONSTRAINT account_deletion_token_pkey PRIMARY KEY (id);


--
-- Name: account_deletion_token account_deletion_token_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.account_deletion_token
    ADD CONSTRAINT account_deletion_token_token_hash_key UNIQUE (token_hash);


--
-- Name: album_artist album_artist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.album_artist
    ADD CONSTRAINT album_artist_pkey PRIMARY KEY (album_id, artist_id);


--
-- Name: album_genre album_genre_pkey; Type: CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.album_genre
    ADD CONSTRAINT album_genre_pkey PRIMARY KEY (id);


--
-- Name: album album_mbid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.album
    ADD CONSTRAINT album_mbid_key UNIQUE (mbid);


--
-- Name: album album_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.album
    ADD CONSTRAINT album_pkey PRIMARY KEY (id);


--
-- Name: album album_releaseid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.album
    ADD CONSTRAINT album_releaseid_key UNIQUE (releaseid);


--
-- Name: album_suggestion album_suggestion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.album_suggestion
    ADD CONSTRAINT album_suggestion_pkey PRIMARY KEY (id);


--
-- Name: artist artist_mbid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.artist
    ADD CONSTRAINT artist_mbid_key UNIQUE (mbid);


--
-- Name: artist artist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.artist
    ADD CONSTRAINT artist_pkey PRIMARY KEY (id);


--
-- Name: chat_message chat_message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_pkey PRIMARY KEY (id);


--
-- Name: chat_report_message chat_report_message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_report_message
    ADD CONSTRAINT chat_report_message_pkey PRIMARY KEY (id);


--
-- Name: chat_room_invite chat_room_invite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_invite
    ADD CONSTRAINT chat_room_invite_pkey PRIMARY KEY (chat_room_id, user_id);


--
-- Name: chat_room_join_request chat_room_join_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_join_request
    ADD CONSTRAINT chat_room_join_request_pkey PRIMARY KEY (chat_room_id, user_id);


--
-- Name: chat_room_member chat_room_member_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_member
    ADD CONSTRAINT chat_room_member_pkey PRIMARY KEY (chat_room_id, user_id);


--
-- Name: chat_room chat_room_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room
    ADD CONSTRAINT chat_room_pkey PRIMARY KEY (id);


--
-- Name: chat_room_report chat_room_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_report
    ADD CONSTRAINT chat_room_report_pkey PRIMARY KEY (id);


--
-- Name: edit_request edit_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.edit_request
    ADD CONSTRAINT edit_request_pkey PRIMARY KEY (id);


--
-- Name: favorite_album favorite_album_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_album
    ADD CONSTRAINT favorite_album_pkey PRIMARY KEY (id);


--
-- Name: favorite_song favorite_song_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_song
    ADD CONSTRAINT favorite_song_pkey PRIMARY KEY (id);


--
-- Name: genre genre_genre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genre
    ADD CONSTRAINT genre_genre_key UNIQUE (genre);


--
-- Name: genre genre_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genre
    ADD CONSTRAINT genre_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: password_reset_token password_reset_token_pkey; Type: CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.password_reset_token
    ADD CONSTRAINT password_reset_token_pkey PRIMARY KEY (id);


--
-- Name: password_reset_token password_reset_token_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.password_reset_token
    ADD CONSTRAINT password_reset_token_token_hash_key UNIQUE (token_hash);


--
-- Name: refresh_token refresh_token_pkey; Type: CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_pkey PRIMARY KEY (id);


--
-- Name: refresh_token refresh_token_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_token_hash_key UNIQUE (token_hash);


--
-- Name: review review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_pkey PRIMARY KEY (id);


--
-- Name: song_artist song_artist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.song_artist
    ADD CONSTRAINT song_artist_pkey PRIMARY KEY (song_id, artist_id);


--
-- Name: song song_mbid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.song
    ADD CONSTRAINT song_mbid_key UNIQUE (mbid);


--
-- Name: song song_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.song
    ADD CONSTRAINT song_pkey PRIMARY KEY (id);


--
-- Name: review unique_user_album_review; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT unique_user_album_review UNIQUE (user_id, album_id);


--
-- Name: upcoming_release upcoming_release_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upcoming_release
    ADD CONSTRAINT upcoming_release_pkey PRIMARY KEY (id);


--
-- Name: album_genre uq_album_genre; Type: CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.album_genre
    ADD CONSTRAINT uq_album_genre UNIQUE (album_id, genre_id);


--
-- Name: favorite_album uq_favorite_album; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_album
    ADD CONSTRAINT uq_favorite_album UNIQUE (user_id, album_id);


--
-- Name: favorite_song uq_favorite_song; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_song
    ADD CONSTRAINT uq_favorite_song UNIQUE (user_id, song_id);


--
-- Name: user_follow uq_follow; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follow
    ADD CONSTRAINT uq_follow UNIQUE (follower_id, following_id);


--
-- Name: review uq_review_user_album; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT uq_review_user_album UNIQUE (user_id, album_id);


--
-- Name: user_account user_account_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_email_key UNIQUE (email);


--
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (id);


--
-- Name: user_account user_account_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_username_key UNIQUE (username);


--
-- Name: user_follow user_follow_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follow
    ADD CONSTRAINT user_follow_pkey PRIMARY KEY (id);


--
-- Name: user_list_album user_list_album_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_list_album
    ADD CONSTRAINT user_list_album_pkey PRIMARY KEY (list_id, album_id);


--
-- Name: user_list user_list_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_list
    ADD CONSTRAINT user_list_pkey PRIMARY KEY (id);


--
-- Name: idx_account_deletion_token_user_id; Type: INDEX; Schema: public; Owner: soundtrack
--

CREATE INDEX idx_account_deletion_token_user_id ON public.account_deletion_token USING btree (user_id);


--
-- Name: idx_album_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_album_created_at ON public.album USING btree (created_at);


--
-- Name: idx_album_suggestion_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_album_suggestion_status ON public.album_suggestion USING btree (status);


--
-- Name: idx_chat_message_room_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_message_room_time ON public.chat_message USING btree (room_id, sent_at DESC);


--
-- Name: idx_chat_report_message_report; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_report_message_report ON public.chat_report_message USING btree (report_id);


--
-- Name: idx_chat_room_report_room; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_room_report_room ON public.chat_room_report USING btree (room_id);


--
-- Name: idx_chat_room_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_room_topic ON public.chat_room USING btree (topic_type, topic_id);


--
-- Name: idx_notification_recipient_created; Type: INDEX; Schema: public; Owner: soundtrack
--

CREATE INDEX idx_notification_recipient_created ON public.notification USING btree (recipient_id, created_at DESC);


--
-- Name: idx_password_reset_token_user_id; Type: INDEX; Schema: public; Owner: soundtrack
--

CREATE INDEX idx_password_reset_token_user_id ON public.password_reset_token USING btree (user_id);


--
-- Name: idx_refresh_token_user_id; Type: INDEX; Schema: public; Owner: soundtrack
--

CREATE INDEX idx_refresh_token_user_id ON public.refresh_token USING btree (user_id);


--
-- Name: idx_upcoming_release_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_upcoming_release_date ON public.upcoming_release USING btree (release_date);


--
-- Name: idx_user_account_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_account_deleted_at ON public.user_account USING btree (deleted_at);


--
-- Name: idx_user_follow_follower; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_follow_follower ON public.user_follow USING btree (follower_id);


--
-- Name: idx_user_follow_following; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_follow_following ON public.user_follow USING btree (following_id);


--
-- Name: account_deletion_token account_deletion_token_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.account_deletion_token
    ADD CONSTRAINT account_deletion_token_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id);


--
-- Name: album_suggestion album_suggestion_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.album_suggestion
    ADD CONSTRAINT album_suggestion_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.user_account(id) ON DELETE SET NULL;


--
-- Name: album_suggestion album_suggestion_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.album_suggestion
    ADD CONSTRAINT album_suggestion_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.user_account(id) ON DELETE SET NULL;


--
-- Name: chat_message chat_message_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_room(id) ON DELETE CASCADE;


--
-- Name: chat_message chat_message_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.user_account(id);


--
-- Name: chat_report_message chat_report_message_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_report_message
    ADD CONSTRAINT chat_report_message_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.chat_room_report(id) ON DELETE CASCADE;


--
-- Name: chat_room chat_room_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room
    ADD CONSTRAINT chat_room_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.user_account(id);


--
-- Name: chat_room_invite chat_room_invite_chat_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_invite
    ADD CONSTRAINT chat_room_invite_chat_room_id_fkey FOREIGN KEY (chat_room_id) REFERENCES public.chat_room(id) ON DELETE CASCADE;


--
-- Name: chat_room_invite chat_room_invite_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_invite
    ADD CONSTRAINT chat_room_invite_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id) ON DELETE CASCADE;


--
-- Name: chat_room_join_request chat_room_join_request_chat_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_join_request
    ADD CONSTRAINT chat_room_join_request_chat_room_id_fkey FOREIGN KEY (chat_room_id) REFERENCES public.chat_room(id) ON DELETE CASCADE;


--
-- Name: chat_room_join_request chat_room_join_request_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_join_request
    ADD CONSTRAINT chat_room_join_request_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id) ON DELETE CASCADE;


--
-- Name: chat_room_member chat_room_member_chat_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_member
    ADD CONSTRAINT chat_room_member_chat_room_id_fkey FOREIGN KEY (chat_room_id) REFERENCES public.chat_room(id) ON DELETE CASCADE;


--
-- Name: chat_room_member chat_room_member_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_member
    ADD CONSTRAINT chat_room_member_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id) ON DELETE CASCADE;


--
-- Name: chat_room_report chat_room_report_handled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_report
    ADD CONSTRAINT chat_room_report_handled_by_fkey FOREIGN KEY (handled_by) REFERENCES public.user_account(id) ON DELETE SET NULL;


--
-- Name: chat_room_report chat_room_report_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_report
    ADD CONSTRAINT chat_room_report_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.user_account(id) ON DELETE SET NULL;


--
-- Name: chat_room_report chat_room_report_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_report
    ADD CONSTRAINT chat_room_report_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.user_account(id) ON DELETE SET NULL;


--
-- Name: edit_request edit_request_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.edit_request
    ADD CONSTRAINT edit_request_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.user_account(id);


--
-- Name: edit_request edit_request_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.edit_request
    ADD CONSTRAINT edit_request_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.user_account(id);


--
-- Name: favorite_album favorite_album_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_album
    ADD CONSTRAINT favorite_album_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.album(id) ON DELETE CASCADE;


--
-- Name: favorite_album favorite_album_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_album
    ADD CONSTRAINT favorite_album_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id) ON DELETE CASCADE;


--
-- Name: favorite_song favorite_song_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_song
    ADD CONSTRAINT favorite_song_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.song(id) ON DELETE CASCADE;


--
-- Name: favorite_song favorite_song_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_song
    ADD CONSTRAINT favorite_song_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id) ON DELETE CASCADE;


--
-- Name: album_artist fk_albumartist_album; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.album_artist
    ADD CONSTRAINT fk_albumartist_album FOREIGN KEY (album_id) REFERENCES public.album(id) ON DELETE CASCADE;


--
-- Name: album_artist fk_albumartist_artist; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.album_artist
    ADD CONSTRAINT fk_albumartist_artist FOREIGN KEY (artist_id) REFERENCES public.artist(id) ON DELETE CASCADE;


--
-- Name: album_genre fk_albumgenre_album; Type: FK CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.album_genre
    ADD CONSTRAINT fk_albumgenre_album FOREIGN KEY (album_id) REFERENCES public.album(id) ON DELETE CASCADE;


--
-- Name: album_genre fk_albumgenre_genre; Type: FK CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.album_genre
    ADD CONSTRAINT fk_albumgenre_genre FOREIGN KEY (genre_id) REFERENCES public.genre(id) ON DELETE CASCADE;


--
-- Name: notification fk_notification_actor; Type: FK CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT fk_notification_actor FOREIGN KEY (actor_id) REFERENCES public.user_account(id);


--
-- Name: notification fk_notification_recipient; Type: FK CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id) REFERENCES public.user_account(id);


--
-- Name: review fk_review_album; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT fk_review_album FOREIGN KEY (album_id) REFERENCES public.album(id);


--
-- Name: review fk_review_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES public.user_account(id);


--
-- Name: song fk_song_album; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.song
    ADD CONSTRAINT fk_song_album FOREIGN KEY (album_id) REFERENCES public.album(id) ON DELETE CASCADE;


--
-- Name: song_artist fk_songartist_artist; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.song_artist
    ADD CONSTRAINT fk_songartist_artist FOREIGN KEY (artist_id) REFERENCES public.artist(id) ON DELETE CASCADE;


--
-- Name: song_artist fk_songartist_song; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.song_artist
    ADD CONSTRAINT fk_songartist_song FOREIGN KEY (song_id) REFERENCES public.song(id) ON DELETE CASCADE;


--
-- Name: user_list fk_userlist_owner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_list
    ADD CONSTRAINT fk_userlist_owner FOREIGN KEY (owner_id) REFERENCES public.user_account(id) ON DELETE CASCADE;


--
-- Name: user_list_album fk_userlistalbum_album; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_list_album
    ADD CONSTRAINT fk_userlistalbum_album FOREIGN KEY (album_id) REFERENCES public.album(id) ON DELETE CASCADE;


--
-- Name: user_list_album fk_userlistalbum_list; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_list_album
    ADD CONSTRAINT fk_userlistalbum_list FOREIGN KEY (list_id) REFERENCES public.user_list(id) ON DELETE CASCADE;


--
-- Name: password_reset_token password_reset_token_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.password_reset_token
    ADD CONSTRAINT password_reset_token_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id);


--
-- Name: refresh_token refresh_token_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: soundtrack
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id);


--
-- Name: user_follow user_follow_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follow
    ADD CONSTRAINT user_follow_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.user_account(id) ON DELETE CASCADE;


--
-- Name: user_follow user_follow_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follow
    ADD CONSTRAINT user_follow_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.user_account(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

