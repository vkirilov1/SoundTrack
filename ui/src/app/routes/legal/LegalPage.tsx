import type { ReactNode } from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import PageContainer from "../../../components/PageContainer/PageContainer";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  intro?: ReactNode;
  children: ReactNode;
}

function LegalPage({ title, lastUpdated, intro, children }: LegalPageProps) {
  return (
    <PageContainer maxW="760px">
      <Heading as="h1" fontSize="30px" m="0">
        {title}
      </Heading>
      <Text mt="6px" fontSize="13px" color="text">
        Last updated {lastUpdated}
      </Text>

      {intro && (
        <Text mt="20px" fontSize="14px" color="ink" lineHeight="1.6">
          {intro}
        </Text>
      )}

      <VStack align="stretch" gap="28px" mt="28px">
        {children}
      </VStack>
    </PageContainer>
  );
}

interface LegalSectionProps {
  title: string;
  children: ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <Box as="section">
      <Heading as="h2" fontSize="18px" m="0" mb="8px">
        {title}
      </Heading>
      <VStack
        align="stretch"
        gap="10px"
        fontSize="14px"
        color="ink"
        lineHeight="1.65"
      >
        {children}
      </VStack>
    </Box>
  );
}

export default LegalPage;
