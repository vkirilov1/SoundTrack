import { Link, Text, chakra } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import LegalPage, { LegalSection } from "./legal/LegalPage";

function PrivacyRoute() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="August 2026"
      intro={
        <>
          This page explains what SoundTrack stores about you and why, in plain
          language.
        </>
      }
    >
      <LegalSection title="1. What we store">
        <Text m="0">
          Account info (username, email, a hashed password - we never store your
          password in plain text), an optional bio and profile photo, your
          reviews, ratings, lists, and follows.
        </Text>
      </LegalSection>

      <LegalSection title="2. Cookies">
        <Text m="0">
          We use cookies for exactly one purpose: keeping you signed in. A
          short-lived access token and, if you choose "remember me," a
          longer-lived refresh token - both httpOnly, meaning page scripts (ours
          or anyone else's) can't read them.
        </Text>
        <Text m="0">
          <strong>We don't use tracking or advertising cookies</strong>, we
          don't run third-party analytics that fingerprint you, and{" "}
          <strong>we never sell or share cookie data with third parties</strong>
          . Cookies exist purely to remember who you are between requests -
          nothing else.
        </Text>
      </LegalSection>

      <LegalSection title="3. Emails we send">
        <Text m="0">
          SoundTrack sends transactional email only: a password reset link if
          you request one, and an account-restore link if you delete your
          account and might want to undo it. We don't send marketing email, and
          your address isn't shared with or sold to advertisers or other third
          parties. These emails are delivered through a third-party email
          provider acting solely on our behalf to send them - it doesn't use
          your address for anything else.
        </Text>
      </LegalSection>

      <LegalSection title="4. Chat messages">
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

      <LegalSection title="5. Who can see what">
        <Text m="0">
          Your profile, reviews, and lists are visible to anyone using the site,
          signed in or not. Chat messages are visible only to current members of
          that specific room. Admins can join any chat room to investigate a
          report - this is done openly, as a normal member, never hidden from
          the room.
        </Text>
      </LegalSection>

      <LegalSection title="6. Moderation records">
        <Text m="0">
          When a room is reported or an admin deletes a room directly, we keep a
          record of the action (who reported it, the category, which admin
          acted, and the outcome) as an audit trail. This is separate from - and
          outlives - the chat messages themselves, which follow the deletion
          rules in section 4.
        </Text>
      </LegalSection>

      <LegalSection title="7. Deleting your account">
        <Text m="0">
          You can delete your own account at any time from your profile
          settings, with a password confirmation. Your account is deactivated
          immediately and you're logged out everywhere. We email you a link to
          undo it within 30 days - after that window closes without a restore,
          your account and everything identifying you are permanently erased. (A
          small amount of content that other people depend on, like a chat
          message you sent into someone else's still- open room, stays in place
          but is no longer attributed to you.)
        </Text>
      </LegalSection>

      <LegalSection title="8. Changes to this policy">
        <Text m="0">
          If how we handle data changes meaningfully, we'll update the date at
          the top of this page.
        </Text>
      </LegalSection>

      <chakra.hr borderColor="border" mt="8px" />

      <Text fontSize="12px" color="text" opacity="0.8">
        This policy describes how SoundTrack currently operates and isn't a
        substitute for legal advice. See also our{" "}
        <Link asChild color="accent" textDecoration="underline">
          <RouterLink to="/terms">Terms of Use</RouterLink>
        </Link>
        .
      </Text>
    </LegalPage>
  );
}

export default PrivacyRoute;
