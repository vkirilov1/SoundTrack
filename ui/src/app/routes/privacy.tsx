import { Text, chakra } from "@chakra-ui/react";
import LegalPage, { LegalSection } from "./legal/LegalPage";

function PrivacyRoute() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="August 2026"
      intro={
        <>
          This page explains what SoundTrack stores about you and why, in plain
          language. SoundTrack is a student diploma project - this is an honest
          description of how the app actually works, not a substitute for legal
          advice.
        </>
      }
    >
      <LegalSection title="1. What we store">
        <Text m="0">
          Account info (username, email, a hashed password - we never store your
          password in plain text), an optional bio and profile photo, your
          reviews, ratings, lists, and follows. Authentication uses httpOnly
          cookies, which aren't readable by page scripts.
        </Text>
      </LegalSection>

      <LegalSection title="2. Chat messages">
        <Text m="0">
          Chat is <strong>encrypted in transit</strong> (over HTTPS/WSS once
          deployed behind TLS) but is <strong>not end-to-end encrypted</strong>{" "}
          - the server processes messages in plain text so they can be delivered
          live to other members and reviewed if reported. Messages are visible
          to everyone currently in the room.
        </Text>
        <Text m="0">
          Rooms are temporary: once a room closes (its owner leaves, or is
          disconnected long enough to count as gone), its messages are
          permanently deleted from the database. There is no chat history to
          browse afterward.
        </Text>
        <Text m="0">
          <strong>Exception - reports:</strong> if a room is reported, a
          snapshot of around 20 of its recent messages is copied into a
          moderation record so admins can review what was reported, even after
          the room itself closes. This snapshot is retained as part of the
          moderation audit trail and is only visible to admins.
        </Text>
      </LegalSection>

      <LegalSection title="3. Who can see what">
        <Text m="0">
          Your profile, reviews, and lists are visible to anyone using the site,
          signed in or not, unless you keep a list private. Chat messages are
          visible only to current members of that specific room. Admins can join
          any chat room to investigate a report - this is done openly, as a
          normal member, never hidden from the room.
        </Text>
      </LegalSection>

      <LegalSection title="4. Moderation records">
        <Text m="0">
          When a room is reported or an admin deletes a room directly, we keep a
          record of the action (who reported it, the category, which admin
          acted, and the outcome) as an audit trail. This is separate from - and
          outlives - the chat messages themselves, which follow the deletion
          rules in section 2.
        </Text>
      </LegalSection>

      <LegalSection title="5. Cookies">
        <Text m="0">
          We use httpOnly cookies to keep you signed in (a short-lived access
          token and a longer-lived refresh token if you choose "remember me").
          We don't use third-party tracking or advertising cookies.
        </Text>
      </LegalSection>

      <LegalSection title="6. Your choices">
        <Text m="0">
          You can edit your bio and photo, delete your own reviews and lists,
          and leave any chat room at any time. Contact an admin if you'd like
          your account and its data removed entirely.
        </Text>
      </LegalSection>

      <LegalSection title="7. Changes to this policy">
        <Text m="0">
          If how we handle data changes meaningfully, we'll update the date at
          the top of this page.
        </Text>
      </LegalSection>

      <chakra.hr borderColor="border" mt="8px" />

      <Text fontSize="12px" color="text" opacity="0.8">
        This policy describes a student diploma project. It is not legal advice,
        and a real-world deployment - especially one serving users in the EU
        (GDPR) or other regulated regions - would need review by a qualified
        professional before launch.
      </Text>
    </LegalPage>
  );
}

export default PrivacyRoute;
