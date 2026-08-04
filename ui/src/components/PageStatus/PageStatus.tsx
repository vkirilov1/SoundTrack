import { Image, Text, VStack } from "@chakra-ui/react";
import missingResourcesIcon from "../../assets/MissingResources.png";
import Spinner from "../Spinner/Spinner";

interface PageStatusProps {
  variant: "loading" | "not-found";
  message?: string;
}

function PageStatus({ variant, message }: PageStatusProps) {
  return (
    <VStack gap="12px" textAlign="center" color="text" py="80px">
      {variant === "loading" ? (
        <Spinner />
      ) : (
        <>
          <Image src={missingResourcesIcon} alt="" boxSize="96px" />
          <Text>{message}</Text>
        </>
      )}
    </VStack>
  );
}

export default PageStatus;
