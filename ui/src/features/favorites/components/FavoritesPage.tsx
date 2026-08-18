import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Heading, chakra } from "@chakra-ui/react";
import PageContainer from "../../../components/PageContainer/PageContainer";
import PageStatus from "../../../components/PageStatus/PageStatus";
import PagedSection from "../../../components/PagedSection/PagedSection";
import Pagination from "../../../components/Pagination/Pagination";
import AlbumGridRow from "../../../components/AlbumGridRow/AlbumGridRow";
import FavoriteSongRow from "./FavoriteSongRow";
import { usePagedList } from "../../../hooks/usePagedList";
import {
  getUserProfile,
  getUserFavoriteAlbums,
  getUserFavoriteSongs,
} from "../../profile/api/profileApi";
import { ApiError } from "../../../lib/api-error";
import type { UserProfile } from "../../../types/auth";

const PAGE_SIZE = 20;

function FavoritesPage() {
  const { userId } = useParams<{ userId: string }>();
  const id = Number(userId);
  const invalidId = !Number.isFinite(id);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(() => !invalidId);
  const [notFound, setNotFound] = useState(() => invalidId);

  useEffect(() => {
    if (invalidId) return;

    let cancelled = false;

    getUserProfile(id)
      .then((res) => {
        if (cancelled) return;
        setProfile(res);
        setNotFound(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, invalidId]);

  const fetchAlbums = useCallback(
    (page: number) => getUserFavoriteAlbums(id, page, PAGE_SIZE),
    [id],
  );
  const {
    items: albums,
    page: albumsPage,
    totalPages: albumsTotalPages,
    loading: albumsLoading,
    listLoading: albumsListLoading,
    goToPage: goToAlbumsPage,
  } = usePagedList(fetchAlbums, { enabled: !invalidId && !loading });

  const fetchSongs = useCallback(
    (page: number) => getUserFavoriteSongs(id, page, PAGE_SIZE),
    [id],
  );
  const {
    items: songs,
    page: songsPage,
    totalPages: songsTotalPages,
    loading: songsLoading,
    listLoading: songsListLoading,
    goToPage: goToSongsPage,
  } = usePagedList(fetchSongs, { enabled: !invalidId && !loading });

  if (loading) {
    return (
      <PageContainer>
        <PageStatus variant="loading" />
      </PageContainer>
    );
  }

  if (notFound || !profile) {
    return (
      <PageContainer>
        <PageStatus variant="not-found" message="This user doesn't exist." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Heading as="h1" fontSize="28px" m="0">
        <Box as="span" color="accent">
          {profile.username}
        </Box>
        &rsquo;s favorites
      </Heading>

      <Box mt="32px">
        <Heading as="h2" fontSize="20px">
          Albums
        </Heading>
        <Box mt="12px">
          <PagedSection
            loading={albumsLoading}
            listLoading={albumsListLoading}
            isEmpty={albums.length === 0}
            emptyMessage="No favorite albums yet."
            spinnerLabel="Loading favorite albums"
          >
            <chakra.ul listStyle="none" m="0" p="0">
              {albums.map((album) => (
                <AlbumGridRow key={album.id} album={album} rank={null} />
              ))}
            </chakra.ul>
          </PagedSection>
        </Box>
        <Pagination
          page={albumsPage}
          totalPages={albumsTotalPages}
          onPageChange={goToAlbumsPage}
        />
      </Box>

      <Box mt="40px">
        <Heading as="h2" fontSize="20px">
          Songs
        </Heading>
        <Box mt="12px">
          <PagedSection
            loading={songsLoading}
            listLoading={songsListLoading}
            isEmpty={songs.length === 0}
            emptyMessage="No favorite songs yet."
            spinnerLabel="Loading favorite songs"
          >
            <chakra.ul listStyle="none" m="0" p="0">
              {songs.map((song) => (
                <FavoriteSongRow key={song.id} song={song} />
              ))}
            </chakra.ul>
          </PagedSection>
        </Box>
        <Pagination
          page={songsPage}
          totalPages={songsTotalPages}
          onPageChange={goToSongsPage}
        />
      </Box>
    </PageContainer>
  );
}

export default FavoritesPage;
