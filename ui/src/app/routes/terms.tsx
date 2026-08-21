import { Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import LegalPage, { LegalSection } from "./legal/LegalPage";

function TermsRoute() {
  return (
    <LegalPage
      title="Terms of Use"
      lastUpdated="August 2026"
      intro={
        <>
          SoundTrack is a student diploma project, not a commercial service.
          These terms are here so you know what to expect if you create an
          account - please don't rely on them as a substitute for professional
          legal advice.
        </>
      }
    >
      <LegalSection title="1. Your account">
        <Text m="0">
          You need an account to review albums, build lists, follow other users,
          and use chat rooms. You're responsible for keeping your password
          secure and for activity that happens under your account. You must be
          old enough, under the law that applies to you, to agree to these terms
          on your own.
        </Text>
      </LegalSection>

      <LegalSection title="2. Content you post">
        <Text m="0">
          Reviews, list descriptions, your bio, and profile photo are yours -
          you keep ownership of what you write and upload. By posting them, you
          give SoundTrack permission to display them on the site as part of
          normal operation (e.g. showing your review on an album's page). You're
          responsible for what you post and for having the rights to any photo
          you upload.
        </Text>
      </LegalSection>

      <LegalSection title="3. Chat rooms">
        <Text m="0">
          Chat rooms are live and temporary: a room only exists while its owner
          is connected, and once it ends its messages are permanently deleted.
          Chats are <strong>not private</strong> - anything you send is visible
          to every member of the room for as long as it's open, and can be
          reported. See our{" "}
          <Link asChild color="accent" textDecoration="underline">
            <RouterLink to="/privacy">Privacy Policy</RouterLink>
          </Link>{" "}
          for exactly what that means for message retention.
        </Text>
        <Text m="0">
          You agree not to use chat rooms to harass other users, share illegal
          content, or spam. Only paste-able text and emoji are supported - no
          file or image attachments.
        </Text>
      </LegalSection>

      <LegalSection title="4. Moderation">
        <Text m="0">
          Admins can remove reviews, reset an inappropriate profile photo,
          delete a chat room, and revoke a user's ability to create chat rooms,
          in response to reports or violations of these terms. Where practical,
          we notify you when moderation action is taken on your account or
          content.
        </Text>
      </LegalSection>

      <LegalSection title="5. Account termination">
        <Text m="0">
          You can stop using the service at any time. We may suspend or remove
          an account that repeatedly violates these terms, particularly around
          chat conduct.
        </Text>
      </LegalSection>

      <LegalSection title="6. No warranty">
        <Text m="0">
          This is a student project provided as-is, without warranty of any
          kind, including uptime, data durability, or fitness for a particular
          purpose.
        </Text>
      </LegalSection>

      <LegalSection title="7. Changes">
        <Text m="0">
          We may update these terms as the project evolves. Continuing to use
          SoundTrack after a change means you accept the updated terms.
        </Text>
      </LegalSection>
    </LegalPage>
  );
}

export default TermsRoute;
