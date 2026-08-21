import { Route, Routes } from "react-router-dom";
import AlbumRoute from "./routes/album";
import ArtistRoute from "./routes/artist";
import ChartsRoute from "./routes/charts";
import ChatsRoute from "./routes/chats";
import FavoritesRoute from "./routes/favorites";
import GenreRoute from "./routes/genre";
import HomeRoute from "./routes/home";
import ListRoute from "./routes/list";
import LoginRoute from "./routes/login";
import NotFoundRoute from "./routes/not-found";
import PrivacyRoute from "./routes/privacy";
import ProfileRoute from "./routes/profile";
import ProfileEditRoute from "./routes/profile-edit";
import RegisterRoute from "./routes/register";
import TermsRoute from "./routes/terms";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/register" element={<RegisterRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/profile/edit" element={<ProfileEditRoute />} />
      <Route path="/profile/:userId" element={<ProfileRoute />} />
      <Route path="/profile/:userId/favorites" element={<FavoritesRoute />} />
      <Route path="/album/:albumId" element={<AlbumRoute />} />
      <Route path="/list/:listId" element={<ListRoute />} />
      <Route path="/artist/:artistId" element={<ArtistRoute />} />
      <Route path="/genre/:name" element={<GenreRoute />} />
      <Route path="/charts" element={<ChartsRoute />} />
      <Route path="/charts/:year" element={<ChartsRoute />} />
      <Route path="/chats" element={<ChatsRoute />} />
      <Route path="/terms" element={<TermsRoute />} />
      <Route path="/privacy" element={<PrivacyRoute />} />
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}

export default AppRouter;
